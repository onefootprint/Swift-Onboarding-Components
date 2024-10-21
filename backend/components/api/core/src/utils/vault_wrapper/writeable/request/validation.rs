use super::FingerprintedDataRequest;
use super::ValidatedDataRequest;
use crate::auth::tenant::AuthActor;
use crate::utils::vault_wrapper::PrefillData;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::WriteableVw;
use crate::FpResult;
use api_errors::ValidationError;
use db::models::business_owner::BusinessOwner;
use db::models::contact_info::ContactInfo;
use db::models::contact_info::NewContactInfoArgs;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
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
use newtypes::PreviewApi;
use newtypes::VaultDataFormat;
use newtypes::VaultKind;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Debug, Clone, derive_more::IsVariant)]
pub enum DataRequestSource {
    /// Creating a brand new user during a signup challenge. Some data can be bootstrapped while
    /// others can be entered by the usr
    SignupChallenge(DlSourceWithOverrides),
    /// User-initiated write request. Can be either Components or Hosted
    HostedPatchVault(DlSourceWithOverrides),
    /// After verifying an OTP in `POST /hosted/identify/verify` or `POST
    /// /hosted/user/challenge/verify`
    OtpVerified,
    /// Prefilling data either at ScopedVault creation time or onboarding time
    Prefill,
    /// Writing OCR data received from a vendor
    Ocr,
    /// Writing data received from a vendor
    Vendor,
    /// Tenant-initiated write request
    TenantPatchVault(AuthActor),
    /// Tenant-initiated write request
    ClientTenant,
}

impl DataRequestSource {
    pub fn actor(&self) -> Option<&AuthActor> {
        match self {
            Self::TenantPatchVault(actor) => Some(actor),
            _ => None,
        }
    }

    pub fn dl_source(&self, di: &DataIdentifier) -> DataLifetimeSource {
        match self {
            Self::SignupChallenge(s) => s.get(di),
            Self::HostedPatchVault(s) => s.get(di),
            Self::Ocr => DataLifetimeSource::Ocr,
            Self::Vendor => DataLifetimeSource::Vendor,
            Self::OtpVerified => DataLifetimeSource::LikelyHosted,
            Self::Prefill => DataLifetimeSource::LikelyHosted,
            Self::TenantPatchVault(_) => DataLifetimeSource::Tenant,
            Self::ClientTenant => DataLifetimeSource::ClientTenant,
        }
    }
}

impl<Type> TenantVw<Type> {
    /// Given a DataRequest, validate some invariants before allowing it to be written to the vault.
    /// These invariants are also a function of the data in the vault at the time
    pub fn validate_request(
        &self,
        conn: &mut PgConn,
        request: FingerprintedDataRequest,
        request_source: &DataRequestSource,
    ) -> FpResult<ValidatedDataRequest> {
        self.assert_update_allowed(conn, &request, request_source)?;
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
                    source: request_source.dl_source(&kind),
                    kind,
                    e_data,
                    p_data,
                    format,
                    origin_id: None,
                };
                Ok(vd)
            })
            .collect::<FpResult<Vec<_>>>()?;

        let new_cdos = self.validate_adding_dis(&data, request_source)?;
        let new_ci = self.validate_contact_info(conn, &data, request_source)?;

        let req = ValidatedDataRequest {
            data,
            new_ci,
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
    pub fn validate_prefill_data_request(&self, prefill_data: PrefillData) -> FpResult<ValidatedDataRequest> {
        let PrefillData {
            data,
            fingerprints,
            new_ci,
            ..
        } = prefill_data;
        let new_cdos = self.validate_adding_dis(&data, &DataRequestSource::Prefill)?;
        let request = ValidatedDataRequest {
            data,
            new_ci,
            new_cdos,
            fingerprints,
            is_prefill: true,
        };
        Ok(request)
    }
}

impl<Type> TenantVw<Type> {
    /// Validates that the provided DataRequestSource source is allowed to write contact info,
    /// considering the current contact infos' verification statuses.
    /// Returns the new contact infos' verification statuses, if any.
    fn validate_contact_info(
        &self,
        conn: &mut PgConn,
        data: &[NewVaultData],
        request_source: &DataRequestSource,
    ) -> FpResult<Vec<NewContactInfoArgs<DataIdentifier>>> {
        let updated_ci = data.iter().filter(|d| d.kind.is_unverified_ci()).collect_vec();
        if updated_ci.is_empty() {
            return Ok(vec![]);
        }

        // `id.verified_phone_number` and `id.verified_email` are read-only for now and are only set by
        // OTP verification code
        let can_set_verified_ci_dis = matches!(request_source, DataRequestSource::OtpVerified);
        let is_setting_verified_ci_dis = data.iter().any(|d| d.kind.is_verified_ci());
        if is_setting_verified_ci_dis && !can_set_verified_ci_dis {
            return ValidationError("Can only set verified CI DIs in challenge verification flow").into();
        }

        let can_update_verified_ci = match request_source {
            // No validation for writing contact info at all - can always overwrite verified/unverified CI
            DataRequestSource::SignupChallenge(_)
            | DataRequestSource::OtpVerified
            | DataRequestSource::Prefill => return Ok(vec![]),
            // Can only write CI if it's currently unverified
            DataRequestSource::Ocr | DataRequestSource::Vendor | DataRequestSource::HostedPatchVault(_) => {
                false
            }
            // Can only write CI if the current tenant is allowed to
            DataRequestSource::TenantPatchVault(_) | DataRequestSource::ClientTenant => {
                let tenant = Tenant::get(conn, &self.scoped_vault.tenant_id)?;
                tenant.can_access_preview(&PreviewApi::ManageVerifiedContactInfo)
            }
        };

        let cis_to_replace = updated_ci
            .iter()
            .flat_map(|d| self.data(&d.kind))
            .map(|d| -> FpResult<_> {
                let ci = ContactInfo::get(conn, &d.lifetime.id)?;
                Ok((d.lifetime.kind.clone(), ci))
            })
            .collect::<FpResult<Vec<_>>>()?;

        let validation_errors = cis_to_replace
            .iter()
            .filter(|(_, ci)| ci.is_otp_verified() && !can_update_verified_ci)
            .map(|(di, _)| (di.clone(), DiValidationError::CannotReplaceVerifiedCi.into()))
            .collect::<HashMap<_, _>>();
        if !validation_errors.is_empty() {
            return Err(NtError::from(DataValidationError::FieldValidationError(validation_errors)).into());
        }

        // If the tenant is allowed to overwrite verified CI, the newly written CI should inherit the old
        // CI's verification status so as to not cause a difference in login behavior.
        // This is horribly implicit logic, but is probably the behavior that the tenant wants - vaulting a
        // new piece of contact info should not drastically change the user's login experience.
        // Alternatively, we could expose a vaulting API to specify `id.verified_phone_number` or
        // `id.phone_number` explicitly.
        let inherits_old_verification_status = matches!(
            request_source,
            DataRequestSource::TenantPatchVault(_) | DataRequestSource::ClientTenant
        );
        if !inherits_old_verification_status {
            return Ok(vec![]);
        }
        let new_ci = cis_to_replace
            .into_iter()
            .map(|(di, old_ci)| NewContactInfoArgs {
                is_otp_verified: false,
                identifier: di,
                is_tenant_verified: old_ci.is_otp_verified(),
            })
            .collect();
        Ok(new_ci)
    }

    fn validate_adding_dis(
        &self,
        data: &[NewVaultData],
        // None if adding data not for prefill, Some with the sv_id if adding data for prefill
        request_source: &DataRequestSource,
    ) -> FpResult<HashSet<CollectedDataOption>> {
        // Don't allow replacing some pieces of info
        let mut validation_errors = HashMap::<DataIdentifier, NtError>::new();
        let dis = data.iter().map(|vd| &vd.kind).collect_vec();

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
            if request_source.is_prefill() {
                let is_full_cdo_added_by_other_tenant = full_cdo
                    .data_identifiers()
                    .unwrap_or_default()
                    .into_iter()
                    .flat_map(|di| self.data(&di))
                    .all(|d| d.lifetime.scoped_vault_id != self.scoped_vault.id);
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
            return Err(NtError::from(validation_error).into());
        }

        Ok(new_cdos)
    }

    /// Checks that the provided DIs are allowed to be vaulted
    fn assert_update_allowed(
        &self,
        conn: &mut PgConn,
        request: &FingerprintedDataRequest,
        request_source: &DataRequestSource,
    ) -> FpResult<()> {
        assert_allowed_for_vault(request, self.vault.kind)?;
        assert_allowed_for_sources(request, request_source)?;

        if self.vault.kind == VaultKind::Business {
            if let Some(sv_id) = self.sv_id.as_ref() {
                let sv = ScopedVault::get(conn, sv_id)?;
                let bos = BusinessOwner::list_all(conn, &self.vault.id, &sv.tenant_id)?;
                let has_linked_bos = bos.iter().any(|(bo, _)| bo.source == BusinessOwnerSource::Tenant);
                // TODO stop allowing vaulting this DI at all
                let request_has_vaulted_bos = request.contains_key(&BDK::BeneficialOwners.into());
                if has_linked_bos && request_has_vaulted_bos {
                    // We shouldn't allow BOs to be vaulted when the tenant has already linked BOs
                    // via API
                    let err = newtypes::NtValidationError("Cannot vault beneficial owners when they are already linked via API. Please remove the linked beneficial owners via API before vaulting").into();
                    let errs = HashMap::from_iter([(BDK::BeneficialOwners.into(), err)]);
                    return Err(NtError::from(DataValidationError::FieldValidationError(errs)).into());
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
pub fn assert_allowed_for_sources(
    request: &FingerprintedDataRequest,
    request_source: &DataRequestSource,
) -> NtResult<()> {
    let is_allowed = move |di: &DataIdentifier| -> bool {
        // Restrict the components SDK from adding phone or email
        let source = request_source.dl_source(di);
        if !matches!(request_source, DataRequestSource::SignupChallenge(_)) {
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
#[derive(Debug, Clone)]
pub struct DlSourceWithOverrides {
    pub default: DataLifetimeSource,
    pub overrides: HashMap<DataIdentifier, DataLifetimeSource>,
}

impl From<DataLifetimeSource> for DlSourceWithOverrides {
    fn from(value: DataLifetimeSource) -> Self {
        Self {
            default: value,
            overrides: HashMap::new(),
        }
    }
}

impl DlSourceWithOverrides {
    fn get(&self, di: &DataIdentifier) -> DataLifetimeSource {
        self.overrides.get(di).copied().unwrap_or(self.default)
    }
}
