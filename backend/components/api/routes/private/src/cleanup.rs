use crate::auth::custodian::CustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use api_core::ApiErrorKind;
use api_core::errors::AssertionError;
use api_core::fingerprinter::VaultIdentifier;
use api_core::utils::headers::SandboxId;
use api_wire_types::IdentifyId;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use feature_flag::BoolFlag;
use newtypes::PhoneNumber;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct Request {
    phone_number: PhoneNumber,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct CleanupResponse {
    num_deleted_rows: usize,
}

#[tracing::instrument(skip(state, _custodian))]
#[api_v2_operation(
    description = "Private endpoint to clean up specific integration test user information.",
    tags(Private)
)]
#[post("/private/cleanup")]
async fn post(
    state: web::Data<State>,
    _custodian: CustodianAuthContext,
    request: web::Json<Request>,
    // When provided, identifies only sandbox users with the suffix
    sandbox_id: SandboxId,
) -> actix_web::Result<Json<ResponseData<CleanupResponse>>, ApiError> {
    let Request { phone_number } = request.into_inner();

    // Use e164 without suffix to see if cleanup is allowed for this phone number
    let is_integration_test_phone_number =
        phone_number.e164() == state.config.integration_test_phone_number.e164();
    let is_allowlisted_real_phone_number = state
        .feature_flag_client
        .flag(BoolFlag::CanCleanUpPhoneNumber(&phone_number.e164()));

    if !(is_integration_test_phone_number || is_allowlisted_real_phone_number) {
        return Err(AssertionError("Cannot clean up provided number").into());
    }

    // Use e164 with suffix to compute fingerprint
    let id = IdentifyId::PhoneNumber(phone_number);
    let id = VaultIdentifier::IdentifyId(id, sandbox_id.0);
    let uv = state.find_vault(id, None).await?;

    let user_vault_id = if let Some(uv) = uv {
        uv.id
    } else {
        return Ok(Json(ResponseData::ok(CleanupResponse { num_deleted_rows: 0 })));
    };

    let is_production = state.config.service_config.is_production();

    let ff_client = state.feature_flag_client.clone();
    let num_deleted_rows = state
        .db_pool
        .db_transaction(move |conn| -> Result<usize, ApiError> {
            Vault::lock(conn, &user_vault_id)?;

            if is_production && is_allowlisted_real_phone_number {
                let impacted_tenants: Vec<Tenant> = Tenant::list_by_user_vault_id(conn, &user_vault_id)?;

                let unallowed_affected_tenants: Vec<String> = impacted_tenants
                    .into_iter()
                    .filter(|t| !ff_client.flag(BoolFlag::CanCleanUpTenant(&t.id)))
                    .map(|t| t.id.to_string())
                    .collect();

                if !unallowed_affected_tenants.is_empty() {
                    return Err(ApiErrorKind::AssertionError(format!(
                        "Clearing vault would have impacted tenants: {}",
                        unallowed_affected_tenants.join(",")
                    )))?;
                }
            }

            let num_deleted_rows = db::private_cleanup_integration_tests(conn, user_vault_id)?;
            Ok(num_deleted_rows)
        })
        .await?;

    Ok(Json(ResponseData::ok(CleanupResponse { num_deleted_rows })))
}
