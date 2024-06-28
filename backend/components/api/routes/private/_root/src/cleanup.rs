use actix_web::post;
use actix_web::web;
use api_core::auth::custodian::CustodianAuthContext;
use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::Either;
use api_core::errors::AssertionError;
use api_core::types::ApiResponse;
use api_core::utils::headers::SandboxId;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::ApiCoreError;
use api_core::FpResult;
use api_core::State;
use api_wire_types::IdentifyId;
use db::errors::FpOptionalExtension;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultIdentifier;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use feature_flag::BoolFlag;
use newtypes::email::Email;
use newtypes::PhoneNumber;

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Request {
    PhoneNumber(PhoneNumber),
    Email(Email),
    Id(String),
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct CleanupResponse {
    num_deleted_rows: usize,
}

#[tracing::instrument(skip(state, _auth))]
#[post("/private/cleanup")]
async fn post(
    state: web::Data<State>,
    _auth: Either<CustodianAuthContext, FirmEmployeeAuthContext>,
    request: web::Json<Request>,
    // When provided, identifies only sandbox users with the suffix
    sandbox_id: SandboxId,
) -> ApiResponse<CleanupResponse> {
    let uv_id = match request.into_inner() {
        Request::PhoneNumber(phone_number) => {
            ensure_phone_number_allowed(&state, &phone_number)?;

            // Use e164 with suffix to compute fingerprint
            let id = IdentifyId::PhoneNumber(phone_number);
            let existing = state.find_vault(vec![id], sandbox_id.0, None).await?;
            existing.map(|r| r.0.vault.id)
        }
        Request::Email(email) => {
            // only allow footprint emails to be cleanable
            if !["onefootprint.com", "footprint.dev"].contains(&email.domain().as_str()) {
                return Err(AssertionError("Cannot clean up provided email").into());
            }
            let id = IdentifyId::Email(email);
            let existing = state.find_vault(vec![id], sandbox_id.0, None).await?;

            // this check above is not sufficient because the email may not be verified
            // but attached to someone else's vault (rare -- but technically possible)
            // so we need to fetch the contact info -- and make sure:
            // the phone number associated with the vault either:
            //  1) does not exist OR
            //  2) is one of our allowed-to-clean phone numbers.
            if let Some(existing) = existing {
                let uv_id = existing.0.vault.id;
                let uvw = state
                    .db_pool
                    .db_query(move |conn| VaultWrapper::<Any>::build_portable(conn, &uv_id))
                    .await?;
                let phone = uvw
                    .decrypt_contact_info(&state, newtypes::ContactInfoKind::Phone)
                    .await?;

                if let Some(phone) = phone {
                    if !phone.1.is_otp_verified {
                        return Err(AssertionError(
                            "Cannot clean up via email if user has unverfiied phone number",
                        )
                        .into());
                    }

                    ensure_phone_number_allowed(&state, &PhoneNumber::parse(phone.0)?)?;
                    Some(uvw.vault.id)
                } else {
                    Some(uvw.vault.id)
                }
            } else {
                None
            }
        }
        Request::Id(id) => {
            state
                .db_pool
                .db_query(move |conn| -> FpResult<_> {
                    let id = ScopedVaultIdentifier::SuperAdminView { identifier: &id };
                    let sv = ScopedVault::get(conn, id).optional()?;
                    Ok(sv.map(|sv| sv.vault_id))
                })
                .await?
        }
    };

    let Some(uv_id) = uv_id else {
        return Ok(CleanupResponse { num_deleted_rows: 0 });
    };

    let is_production = state.config.service_config.is_production();

    let ff_client = state.ff_client.clone();
    let num_deleted_rows = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<usize> {
            Vault::lock(conn, &uv_id)?;

            if is_production {
                let impacted_tenants: Vec<Tenant> = Tenant::list_by_user_vault_id(conn, &uv_id)?;

                let unallowed_affected_tenants: Vec<String> = impacted_tenants
                    .into_iter()
                    .filter(|t| !ff_client.flag(BoolFlag::CanCleanUpTenant(&t.id)))
                    .map(|t| t.id.to_string())
                    .collect();

                if !unallowed_affected_tenants.is_empty() {
                    return Err(ApiCoreError::AssertionError(format!(
                        "Clearing vault would have impacted tenants: {}",
                        unallowed_affected_tenants.join(",")
                    )))?;
                }
            }

            let num_deleted_rows = db::private_cleanup_integration_tests(conn, uv_id)?;
            Ok(num_deleted_rows)
        })
        .await?;

    Ok(CleanupResponse { num_deleted_rows })
}

/// check that this phone number can be used to clean a vault
fn ensure_phone_number_allowed(state: &State, phone_number: &PhoneNumber) -> FpResult<bool> {
    // Use e164 to see if cleanup is allowed for this phone number
    let can_clean_up_number = state
        .ff_client
        .flag(BoolFlag::CanCleanUpPhoneNumber(&phone_number.e164()));

    if !can_clean_up_number {
        return Err(AssertionError("Cannot clean up provided number").into());
    }

    Ok(can_clean_up_number)
}
