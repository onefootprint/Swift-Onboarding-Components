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
    IdentityDataKind as IDK, ValidationError, VaultDataFormat,
};
use std::collections::{HashMap, HashSet};

use super::WriteableVw;

/// DataRequest that has been validated through a UserVaultWrapper
pub struct ValidatedDataRequest {
    pub(super) data: Vec<NewVaultData>,
    pub(super) fingerprints: Fingerprints,
    pub(super) new_cdos: HashSet<CollectedDataOption>,
}

impl<Type> VaultWrapper<Type> {
    pub(super) fn validate_adding_dis(
        &self,
        conn: &mut PgConn,
        mut data: HashMap<DataIdentifier, NewVaultData>,
    ) -> ApiResult<(Vec<NewVaultData>, HashSet<CollectedDataOption>)> {
        // Don't allow replacing some pieces of info
        let mut validation_errors = HashMap::<DataIdentifier, newtypes::Error>::new();

        let irreplaceable_ci = [IDK::PhoneNumber.into(), IDK::Email.into()];
        for di in irreplaceable_ci {
            let Some(dl_id) = self.data(&di).map(|d| &d.lifetime.id) else {
                continue;
            };
            let ci = ContactInfo::get(conn, dl_id)?;
            // Remove the offending replacement CI if it exists
            let update_has_di = data.remove(&di).is_some();
            if ci.is_otp_verified && update_has_di {
                validation_errors.insert(di, ValidationError::CannotReplaceVerifiedContactInfo.into());
            }
        }

        let dis = data.keys().collect_vec();
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
            let speculative_cdo_would_replace_full_cdo = speculative_cdo
                .full_variant()
                .map(|full_cdo| existing_cdos.contains(&full_cdo))
                == Some(true);
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

        let data = data.into_values().collect_vec();
        Ok((data, new_cdos))
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
                    kind: kind.clone(),
                    e_data,
                    p_data,
                    format,
                };
                Ok((kind, vd))
            })
            .collect::<ApiResult<_>>()?;

        let (data, new_cdos) = self.validate_adding_dis(conn, data)?;

        let req = ValidatedDataRequest {
            data,
            fingerprints,
            new_cdos,
        };
        Ok(req)
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

        // Point fingerprints to the same lifetime used for the corresponding VD row
        let fingerprints: Vec<_> = self
            .fingerprints
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
            .filter(|vd| {
                matches!(
                    vd.kind,
                    DataIdentifier::Id(IDK::PhoneNumber) | DataIdentifier::Id(IDK::Email)
                )
            })
            // TODO copy this CI from the old CI if any
            .map(|vd| NewContactInfoArgs {
                is_verified: false,
                is_otp_verified: false,
                priority: ContactInfoPriority::Primary,
                lifetime_id: vd.lifetime_id.clone(),
            })
            .collect_vec();
        let ci = ContactInfo::bulk_create(conn, new_contact_info)?;

        let saved_data = SavedData { vd, ci, seqno };
        Ok(saved_data)
    }
}
