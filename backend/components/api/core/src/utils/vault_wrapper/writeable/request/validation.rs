use super::FingerprintedDataRequest;
use super::ValidatedDataRequest;
use crate::auth::tenant::AuthActor;
use crate::utils::vault_wrapper::PrefillData;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::WriteableVw;
use crate::FpResult;
use db::models::business_owner::BusinessOwner;
use db::models::contact_info::ContactInfo;
use db::models::scoped_vault::ScopedVault;
use db::models::vault_data::NewVaultData;
use db::PgConn;
use itertools::Itertools;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerSource;
use newtypes::CollectedDataOption;
use newtypes::DataIdentifier;
use newtypes::DataIdentifierDiscriminant;
use newtypes::DataLifetimeSource;
use newtypes::DataValidationError;
use newtypes::DiValidationError;
use newtypes::Error as NtError;
use newtypes::IdentityDataKind as IDK;
use newtypes::NtResult;
use newtypes::ScopedVaultId;
use newtypes::VaultDataFormat;
use newtypes::VaultKind;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Clone, Copy)]
pub enum DataRequestSource {
    CreateVault,
    PatchVault,
    UpdateContactInfo,
}

impl<Type> VaultWrapper<Type> {
    /// Given a DataRequest, validate some invariants before allowing it to be written to the vault.
    /// These invariants are also a function of the data in the vault at the time
    pub fn validate_request(
        &self,
        conn: &mut PgConn,
        request: FingerprintedDataRequest,
        sources: DataLifetimeSources,
        actor: Option<AuthActor>,
        request_source: DataRequestSource,
    ) -> FpResult<ValidatedDataRequest> {
        self.assert_update_allowed(conn, &request, &sources, request_source)?;
        // Transform the request into a Vec<NewVaultData>
        let FingerprintedDataRequest {
            data,
            json_fields,
            fingerprints,
        } = request;
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
                    source: sources.get(&kind),
                    kind,
                    e_data,
                    p_data,
                    format,
                    origin_id: None,
                };
                Ok(vd)
            })
            .collect::<FpResult<Vec<_>>>()?;

        let for_replacing_ci = matches!(request_source, DataRequestSource::UpdateContactInfo);
        let new_cdos = self.validate_adding_dis(conn, &data, None, actor, for_replacing_ci)?;

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
    ) -> FpResult<ValidatedDataRequest> {
        let PrefillData {
            data,
            fingerprints,
            old_ci,
            ..
        } = prefill_data;
        let new_cdos = self.validate_adding_dis(conn, &data, Some(&self.sv.id), None, false)?;
        let request = ValidatedDataRequest {
            data,
            old_ci,
            new_cdos,
            fingerprints,
            is_prefill: true,
        };
        Ok(request)
    }
}

impl<Type> VaultWrapper<Type> {
    fn validate_adding_dis(
        &self,
        conn: &mut PgConn,
        data: &[NewVaultData],
        // None if adding data not for prefill, Some with the sv_id if adding data for prefill
        prefill_sv_id: Option<&ScopedVaultId>,
        actor: Option<AuthActor>,
        for_replacing_ci: bool,
    ) -> FpResult<HashSet<CollectedDataOption>> {
        // Don't allow replacing some pieces of info
        let mut validation_errors = HashMap::<DataIdentifier, newtypes::Error>::new();
        let dis = data.iter().map(|vd| &vd.kind).collect_vec();

        let irreplaceable_ci = if !for_replacing_ci {
            vec![IDK::PhoneNumber.into(), IDK::Email.into()]
        } else {
            vec![]
        };
        for di in irreplaceable_ci {
            let Some(d) = self.data(&di) else {
                // If the DI doesn't exist yet, we're just adding the data, which is safe.
                continue;
            };
            let ci = ContactInfo::get(conn, &d.lifetime.id)?;
            let update_has_di = dis.contains(&&di);
            // TODO should we disallow updating the email for any vault that is_verified?
            if ci.is_otp_verified && update_has_di {
                if matches!(actor, Some(AuthActor::FirmEmployee(_))) {
                    // Don't error, allow firm employees (who already have write permissions) to
                    // be able to replace CI
                    tracing::error!("Firm employee is updating verified ContactInfo! Note that this won't entirely work properly - the new ContactInfo is marked as unverified, which causes weird bugs. Please repair the vault manually");
                } else if prefill_sv_id.is_none() {
                    validation_errors.insert(di, DiValidationError::CannotReplaceVerifiedContactInfo.into());
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
                validation_errors.insert(di, DiValidationError::CannotReplaceData.into());
            }
        }

        // Then, validate that we're not overwriting any full data with partial data.
        // For example, we shouldn't let you provide an Ssn4 if we already have an Ssn9.
        let existing_cdos = CollectedDataOption::list_from(self.populated_dis());
        let new_cdos = CollectedDataOption::list_from(dis.iter().map(|x| (*x).clone()).collect());
        for speculative_cdo in &new_cdos {
            let Some(full_cdo) = speculative_cdo.full_variant() else {
                continue;
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
                    // If the full CDO was added by another tenant and this is prefill data, temporarily allow
                    // it
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
                    let err: NtError =
                        DiValidationError::PartialUpdateNotAllowed(speculative_cdo.clone()).into();
                    validation_errors.insert(di, err);
                }
            }
        }

        // ensure that we aren't adding a conflicting DI (i.e. itin when ssn9 exists)
        for di in &dis {
            let di_clone = (*di).clone();
            di.conflicting_data_identifiers()
                .iter()
                .filter(|conflict| self.data(conflict).is_some() || dis.contains(conflict))
                .for_each(|conflict| {
                    let err: NtError = DiValidationError::ConflictingDataNotAllowed(conflict.clone()).into();
                    validation_errors.insert(di_clone.clone(), err);
                });
        }


        if !validation_errors.is_empty() {
            let validation_error = DataValidationError::FieldValidationError(validation_errors);
            return Err(newtypes::Error::from(validation_error).into());
        }

        Ok(new_cdos)
    }

    /// Checks that the provided DIs are allowed to be vaulted
    fn assert_update_allowed(
        &self,
        conn: &mut PgConn,
        request: &FingerprintedDataRequest,
        sources: &DataLifetimeSources,
        request_source: DataRequestSource,
    ) -> FpResult<()> {
        assert_allowed_for_vault(request, self.vault.kind)?;
        assert_allowed_for_sources(request, sources, request_source)?;

        if self.vault.kind == VaultKind::Business {
            if let Some(sv_id) = self.sv_id.as_ref() {
                let sv = ScopedVault::get(conn, sv_id)?;
                let has_linked_bos = BusinessOwner::list_all(conn, &self.vault.id, &sv.tenant_id)?
                    .iter()
                    .any(|(bo, _)| bo.source == BusinessOwnerSource::Tenant);
                let request_has_vaulted_bos = request.contains_key(&BDK::BeneficialOwners.into());
                if has_linked_bos && request_has_vaulted_bos {
                    // We shouldn't allow BOs to be vaulted when the tenant has already linked BOs
                    // via API
                    let err = newtypes::ValidationError("Cannot vault beneficial owners when they are already linked via API. Please remove the linked beneficial owners via API before vaulting").into();
                    let errs = HashMap::from_iter([(BDK::BeneficialOwners.into(), err)]);
                    return Err(
                        newtypes::Error::from(DataValidationError::FieldValidationError(errs)).into(),
                    );
                }
            }
        }
        Ok(())
    }
}

/// Enforce that this update only has the allowable set of DIs based on the vault kind
fn assert_allowed_for_vault(request: &FingerprintedDataRequest, kind: VaultKind) -> NtResult<()> {
    // Keep full match statements here so we have to implement this any time there's a new
    // VaultKind or DataIdentifierDiscriminant
    let is_allowed =
        move |di: &DataIdentifier| -> bool { DataIdentifierDiscriminant::from(di).is_allowed_for(kind) };

    let disallowed_keys = request.keys().filter(|di| !is_allowed(di)).collect_vec();
    if !disallowed_keys.is_empty() {
        let field_errors = disallowed_keys
            .into_iter()
            .map(|di| (di.clone(), NtError::IncompatibleDataIdentifier))
            .collect();
        return Err(DataValidationError::FieldValidationError(field_errors).into());
    }

    Ok(())
}

/// Enforce that this update only has the allowable set of DIs based on the vault kind
fn assert_allowed_for_sources(
    request: &FingerprintedDataRequest,
    sources: &DataLifetimeSources,
    request_source: DataRequestSource,
) -> NtResult<()> {
    let is_allowed = move |di: &DataIdentifier| -> bool {
        // Restrict the components SDK from adding phone or email
        let source = sources.get(di);
        if !matches!(request_source, DataRequestSource::CreateVault) {
            #[allow(clippy::match_like_matches_macro)]
            match (source, di) {
                // When a vault is being created, we support setting phone/email via the components SDK
                // since this comes via the signup challenge API. But at any other time, the components SDK
                // isn't allowed to vault these
                (DataLifetimeSource::LikelyComponentsSdk, DataIdentifier::Id(IDK::PhoneNumber)) => {
                    return false
                }
                (DataLifetimeSource::LikelyComponentsSdk, DataIdentifier::Id(IDK::Email)) => return false,
                _ => (),
            }
        }
        #[allow(clippy::single_match)]
        match (source, di) {
            // Tenants cannot add KycedBeneficialOwners - this is only editable via bifrost.
            // Tenants should either user BeneficialOwners or just link BOs via API
            (DataLifetimeSource::Tenant, DataIdentifier::Business(BDK::KycedBeneficialOwners)) => {
                return false
            }
            _ => (),
        }
        true
    };

    let disallowed_keys = request.keys().filter(|di| !is_allowed(di)).collect_vec();
    if !disallowed_keys.is_empty() {
        let field_errors = disallowed_keys
            .into_iter()
            .map(|di| (di.clone(), NtError::CannotAddDiWithSource))
            .collect();
        return Err(DataValidationError::FieldValidationError(field_errors).into());
    }
    Ok(())
}

/// Helper struct to store which pieces of data have which DL sources.
pub struct DataLifetimeSources {
    default: DataLifetimeSource,
    overrides: HashMap<DataIdentifier, DataLifetimeSource>,
}

impl DataLifetimeSources {
    pub fn single(source: DataLifetimeSource) -> Self {
        Self {
            default: source,
            overrides: HashMap::new(),
        }
    }

    pub fn overrides(
        source: DataLifetimeSource,
        overrides: HashMap<DataIdentifier, DataLifetimeSource>,
    ) -> Self {
        Self {
            default: source,
            overrides,
        }
    }

    fn get(&self, di: &DataIdentifier) -> DataLifetimeSource {
        self.overrides.get(di).copied().unwrap_or(self.default)
    }
}
