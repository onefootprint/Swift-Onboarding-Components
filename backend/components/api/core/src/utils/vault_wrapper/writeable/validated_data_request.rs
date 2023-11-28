use crate::{
    auth::tenant::AuthActor,
    errors::{ApiResult, AssertionError},
    utils::vault_wrapper::VaultWrapper,
};
use db::{
    models::{
        contact_info::{ContactInfo, NewContactInfoArgs},
        data_lifetime::DataLifetime,
        fingerprint::{Fingerprint, NewFingerprint},
        vault_data::{NewVaultData, VaultData},
    },
    PgConn, TxnPgConn,
};
use itertools::Itertools;
use newtypes::{
    output::Csv, BusinessDataKind as BDK, CollectedDataOption, ContactInfoPriority, DataIdentifier,
    DataLifetimeSeqno, DataLifetimeSource, DataRequest, FingerprintRequest, Fingerprints,
    IdentityDataKind as IDK, ScopedVaultId, ValidationError, VaultDataFormat,
};
use std::collections::{HashMap, HashSet};

use super::{PrefillData, WriteableVw};

/// DataRequest that has been validated through a UserVaultWrapper
pub struct ValidatedDataRequest {
    pub(super) data: Vec<NewVaultData>,
    /// On prefilled ValidatedDataRequests, includes the existing CI for any phone/email being prefilled
    old_ci: HashMap<DataIdentifier, ContactInfo>,
    fingerprints: Fingerprints,
    new_cdos: HashSet<CollectedDataOption>,
    pub(super) is_prefill: bool,
}

impl<Type> VaultWrapper<Type> {
    pub(super) fn validate_adding_dis(
        &self,
        conn: &mut PgConn,
        data: &[NewVaultData],
        // None if adding data not for prefill, Some with the sv_id if adding data for prefill
        prefill_sv_id: Option<&ScopedVaultId>,
    ) -> ApiResult<HashSet<CollectedDataOption>> {
        // Don't allow replacing some pieces of info
        let mut validation_errors = HashMap::<DataIdentifier, newtypes::Error>::new();
        let dis = data.iter().map(|vd| &vd.kind).collect_vec();

        let irreplaceable_ci = [IDK::PhoneNumber.into(), IDK::Email.into()];
        for di in irreplaceable_ci {
            let Some(d) = self.data(&di) else {
                continue;
            };
            let ci = ContactInfo::get(conn, &d.lifetime.id)?;
            let update_has_di = dis.contains(&&di);
            if ci.is_otp_verified && update_has_di {
                if prefill_sv_id.is_none() {
                    validation_errors.insert(di, ValidationError::CannotReplaceVerifiedContactInfo.into());
                } else if prefill_sv_id.is_some_and(|sv_id| sv_id == &d.lifetime.scoped_vault_id) {
                    // With our current prefill logic that only prefills for the first WF for a SV,
                    // we shouldn't ever get in a position where we're replacing CI.
                    // Except for a race condition
                    tracing::error!("Unexpected: replacing CI with prefill data");
                }
            }
        }

        let irreplaceable_dis = vec![BDK::KycedBeneficialOwners.into()];
        for di in irreplaceable_dis {
            let update_has_di = dis.iter().any(|x| *x == &di);
            let vault_already_has_di = self.data(&di).is_some();
            if update_has_di && vault_already_has_di {
                validation_errors.insert(di, ValidationError::CannotReplaceData.into());
            }
        }

        // Then, validate that we're not overwriting any full data with partial data.
        // For example, we shouldn't let you provide an Ssn4 if we already have an Ssn9.
        let existing_cdos = CollectedDataOption::list_from(self.populated_dis());
        let new_cdos = CollectedDataOption::list_from(dis.iter().map(|x| (*x).clone()).collect());
        for speculative_cdo in &new_cdos {
            let Some(full_cdo) = speculative_cdo.full_variant() else {
                continue
            };

            // Some clunky logic to allow partial updates, which may need to happen while the
            // tenant-view of the user is still built using portable data from other tenants
            // TODO rm this after backfill. Maybe switch to dropping partial CDOs for prefill data
            // if a full CDO already exists
            if let Some(prefill_sv_id) = prefill_sv_id {
                let is_full_cdo_added_by_other_tenant = full_cdo
                    .data_identifiers()
                    .unwrap_or_default()
                    .into_iter()
                    .flat_map(|di| self.data(&di))
                    .all(|d| &d.lifetime.scoped_vault_id != prefill_sv_id);
                if is_full_cdo_added_by_other_tenant {
                    // If the full CDO was added by another tenant and this is prefill data, temporarily allow it
                    continue;
                }
            }

            // If the full CDO was added by this tenant, never want to allow replacing it
            let speculative_cdo_would_replace_full_cdo = existing_cdos.contains(&full_cdo);
            if speculative_cdo_would_replace_full_cdo {
                // For each DI in this offending CDO, make a pretty error that shows that the DI
                // would be overwriting the full CDO that already exists
                for di in speculative_cdo
                    .data_identifiers()
                    .into_iter()
                    .flatten()
                    .filter(|di| dis.contains(&di))
                {
                    let err = ValidationError::PartialUpdateNotAllowed(speculative_cdo.clone()).into();
                    validation_errors.insert(di, err);
                }
            }
        }
        if !validation_errors.is_empty() {
            let validation_error = newtypes::DataValidationError::FieldValidationError(validation_errors);
            return Err(newtypes::Error::from(validation_error).into());
        }

        Ok(new_cdos)
    }

    /// Given a DataRequest, validate some invariants before allowing it to be written to the vault.
    /// These invariants are also a function of the data in the vault at the time
    pub fn validate_request(
        &self,
        conn: &mut PgConn,
        request: DataRequest<Fingerprints>,
    ) -> ApiResult<ValidatedDataRequest> {
        // Transform the request into a Vec<NewVaultData>
        let (data, json_fields, fingerprints) = request.decompose();
        let data = data
            .into_iter()
            .map(|(kind, pii)| {
                let e_data = self.vault().public_key.seal_pii(&pii)?;
                let p_data = kind.store_plaintext().then_some(pii);
                let format = if json_fields.contains(&kind) {
                    VaultDataFormat::Json
                } else {
                    VaultDataFormat::String
                };
                let vd = NewVaultData {
                    kind,
                    e_data,
                    p_data,
                    format,
                    origin_id: None,
                };
                Ok(vd)
            })
            .collect::<ApiResult<Vec<_>>>()?;

        let new_cdos = self.validate_adding_dis(conn, &data, None)?;

        let req = ValidatedDataRequest {
            data,
            old_ci: HashMap::new(),
            fingerprints,
            new_cdos,
            is_prefill: false,
        };
        Ok(req)
    }
}

impl<Type> WriteableVw<Type> {
    /// Given the source user-scoped vault and destination tenant-scoped vault, assembles the
    /// ValidatedDataRequest that will prefill portable data into the destination vault
    pub fn validate_prefill_data_request(
        &self,
        conn: &mut PgConn,
        prefill_data: PrefillData,
    ) -> ApiResult<ValidatedDataRequest> {
        let PrefillData {
            data,
            fingerprints,
            old_ci,
            ..
        } = prefill_data;
        let new_cdos = self.validate_adding_dis(conn, &data, Some(&self.scoped_vault_id))?;
        let request = ValidatedDataRequest {
            data,
            old_ci,
            new_cdos,
            fingerprints: fingerprints.into_iter().collect(),
            is_prefill: true,
        };
        Ok(request)
    }
}

pub struct SavedData {
    pub vd: Vec<VaultData>,
    pub ci: Vec<ContactInfo>,
    pub seqno: DataLifetimeSeqno,
}

impl ValidatedDataRequest {
    /// Saves the validated updates to the DB
    #[tracing::instrument("ValidatedDataRequest::save", skip_all)]
    pub(super) fn save<Type>(
        self,
        conn: &mut TxnPgConn,
        vw: &WriteableVw<Type>,
        source: DataLifetimeSource,
        actor: Option<AuthActor>,
    ) -> ApiResult<SavedData> {
        if self.data.is_empty() {
            // The request is a no-op, no reason to increment the seqno
            let seqno = DataLifetime::get_current_seqno(conn)?;
            return Ok(SavedData {
                vd: vec![],
                ci: vec![],
                seqno,
            });
        }

        tracing::info!(dis=%Csv::from(self.data.iter().map(|d| d.kind.clone()).collect_vec()), "Saving DIs");
        let sv_id = &vw.scoped_vault_id;
        let v_id = &vw.vault.id;
        // Deactivate old VDs that we have overwritten that belong to this tenant.
        // We will only deactivate speculative, uncommitted data here - never portable data
        let overwrite_kinds = self
            .new_cdos
            .iter()
            .flat_map(|cdo| cdo.parent().options())
            .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default());
        let added_kinds = self.data.iter().map(|nvd| nvd.kind.clone());
        let kinds_to_deactivate = added_kinds
            // Even if we're not providing all fields for a CDO, deactivate old versions of all
            // fields in the CDO. For example, address line 2
            .chain(overwrite_kinds)
            .unique()
            .collect();
        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::bulk_deactivate_speculative(conn, sv_id, kinds_to_deactivate, seqno)?;

        // Create the new VDs
        let actor = actor.map(|a| a.into());
        let vd = VaultData::bulk_create(conn, v_id, sv_id, self.data, seqno, source, actor)?;

        let ci = Self::inner_save(conn, &vd, self.fingerprints, self.old_ci)?;
        let saved_data = SavedData { vd, ci, seqno };
        Ok(saved_data)
    }

    // TODO rm inner method
    /// For the course of the backfill, separates the functionality to save Fingerprints and
    /// ContactInfo into a separate method.
    pub fn inner_save(
        conn: &mut TxnPgConn,
        vd: &[VaultData],
        fingerprints: HashSet<FingerprintRequest>,
        old_ci: HashMap<DataIdentifier, ContactInfo>,
    ) -> ApiResult<Vec<ContactInfo>> {
        // Point fingerprints to the same lifetime used for the corresponding VD row
        let fingerprints: Vec<_> = fingerprints
            .into_iter()
            .map(|req| -> ApiResult<_> {
                let FingerprintRequest {
                    kind,
                    fingerprint,
                    scope,
                } = req;
                let vd = vd
                    .iter()
                    .find(|vd| vd.kind == kind)
                    .ok_or(AssertionError(&format!("No lifetime id found for {}", kind)))?;

                Ok(NewFingerprint {
                    kind: kind.clone(),
                    sh_data: fingerprint,
                    lifetime_id: vd.lifetime_id.clone(),
                    // All fingerprints will start as not unique. Phone number fingerprints
                    // will be marked as unique once the contact info is verified
                    is_unique: false,
                    scope,
                    version: newtypes::FingerprintVersion::current(),
                })
            })
            .collect::<ApiResult<_>>()?;

        Fingerprint::bulk_create(conn, fingerprints)?;

        // Add contact info for the new CIs added
        let new_contact_info = vd
            .iter()
            .filter(|vd| vd.kind.is_contact_info())
            .map(|vd| {
                let old_ci = old_ci.get(&vd.kind);
                NewContactInfoArgs {
                    // Inherit properties of old CI if we are prefilling this CI from portable data
                    is_verified: old_ci.map(|ci| ci.is_verified).unwrap_or(false),
                    is_otp_verified: old_ci.map(|ci| ci.is_otp_verified).unwrap_or(false),
                    priority: old_ci
                        .map(|ci| ci.priority)
                        .unwrap_or(ContactInfoPriority::Primary),
                    lifetime_id: vd.lifetime_id.clone(),
                }
            })
            .collect_vec();
        let ci = ContactInfo::bulk_create(conn, new_contact_info)?;

        Ok(ci)
    }
}
