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
use newtypes::VaultDataFormat;
use newtypes::VaultKind;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Clone, derive_more::IsVariant)]
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

        let new_cdos = self.validate_adding_dis(conn, &data, request_source)?;

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
        let new_cdos = self.validate_adding_dis(conn, &data, &DataRequestSource::Prefill)?;
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

impl<Type> TenantVw<Type> {
    fn validate_adding_dis(
        &self,
        conn: &mut PgConn,
        data: &[NewVaultData],
        // None if adding data not for prefill, Some with the sv_id if adding data for prefill
        request_source: &DataRequestSource,
    ) -> FpResult<HashSet<CollectedDataOption>> {
        // Don't allow replacing some pieces of info
        let mut validation_errors = HashMap::<DataIdentifier, newtypes::Error>::new();
        let dis = data.iter().map(|vd| &vd.kind).collect_vec();

        let for_replacing_ci = matches!(
            request_source,
            DataRequestSource::OtpVerified | DataRequestSource::Prefill,
        );
        let is_setting_verified_ci = dis.iter().any(|x| x.is_verified_ci());
        if is_setting_verified_ci && request_source.actor().is_none() && !for_replacing_ci {
            return ValidationError(
                "Can only set verified CI in tenant-facing API or challenge verification flow",
            )
            .into();
        }

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
                if matches!(request_source.actor(), Some(AuthActor::FirmEmployee(_))) {
                    // Don't error, allow firm employees (who already have write permissions) to
                    // be able to replace CI
                    tracing::error!("Firm employee is updating verified ContactInfo! Note that this won't entirely work properly - the new ContactInfo is marked as unverified, which causes weird bugs. Please repair the vault manually");
                } else if !request_source.is_prefill() {
                    validation_errors.insert(di, DiValidationError::CannotReplaceVerifiedContactInfo.into());
                } else if self.scoped_vault.id == d.lifetime.scoped_vault_id {
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
            return Err(newtypes::Error::from(validation_error).into());
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
#[derive(Clone)]
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
