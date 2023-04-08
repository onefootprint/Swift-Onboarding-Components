use crate::auth::session::AuthSessionData;
use crate::auth::tenant::{SecretTenantAuthContext, TenantAuth};
use crate::auth::user::ValidateUserToken;
use crate::errors::onboarding::OnboardingError;
use crate::types::response::ResponseData;
use crate::utils::session::AuthSession;
use crate::State;
use api_core::errors::ApiResult;
use api_core::types::JsonApiResponse;
use api_core::utils::db2api::DbToApi;
use api_wire_types::{EntityValidateResponse, LegacyValidateResponse, ValidateRequest};
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::{BasicOnboardingInfo, Onboarding, OnboardingIdentifier};
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Validate a transient onboarding session token to exchange it for a long-lived Footprint user token",
    tags(Onboarding, PublicApi)
)]
#[post("/onboarding/session/validate")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<ValidateRequest>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<LegacyValidateResponse> {
    let session = AuthSession::get(&state, &request.validation_token)
        .await?
        .ok_or(OnboardingError::ValidateTokenInvalidOrNotFound)?
        .data;

    let AuthSessionData::ValidateUserToken(ValidateUserToken { ob_id }) = session else {
        return Err(OnboardingError::ValidateTokenInvalidOrNotFound.into());
    };

    let (user_ob, business_ob) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let user_ob = Onboarding::get(conn, &ob_id)?;
            let (ob_config, _) = ObConfiguration::get(conn, &user_ob.0.ob_configuration_id)?;
            let business_ob = if ob_config.must_collect_business() {
                let id = OnboardingIdentifier::BusinessOwner {
                    owner_vault_id: &user_ob.1.vault_id,
                    ob_config_id: &ob_config.id,
                };
                let business_ob = Onboarding::get(conn, id)?;
                Some(business_ob)
            } else {
                None
            };
            Ok((user_ob, business_ob))
        })
        .await??;

    // Support a version of the API that is backwards-compatible for some tenants that integrated
    // with an old version
    let use_legacy_serialization = auth.tenant().pinned_api_version.map(|v| v <= 1) == Some(true);
    let (footprint_user_id, status, requires_manual_review, onboarding_configuration_id, timestamp) =
        if use_legacy_serialization {
            (
                Some(user_ob.1.fp_id.clone()),
                Some(user_ob.0.status),
                Some(user_ob.2.is_some()),
                Some(user_ob.0.ob_configuration_id.clone()),
                Some(user_ob.0.start_timestamp),
            )
        } else {
            (None, None, None, None, None)
        };

    // Validate and serialize the user and optionally the business onboardings
    let validate_and_serialize =
        |ob_info: BasicOnboardingInfo<Onboarding>| -> ApiResult<EntityValidateResponse> {
            if ob_info.1.tenant_id != auth.tenant().id {
                return Err(OnboardingError::TenantMismatch.into());
            }
            if ob_info.1.is_live != auth.is_live()? {
                return Err(OnboardingError::InvalidSandboxState.into());
            }
            if !ob_info.0.status.is_complete() {
                return Err(OnboardingError::NonTerminalState.into());
            }
            let response = api_wire_types::EntityValidateResponse::from_db(ob_info);
            Ok(response)
        };
    let user = validate_and_serialize(user_ob)?;
    let business = business_ob.map(validate_and_serialize).transpose()?;

    let response = LegacyValidateResponse {
        user,
        business,
        footprint_user_id,
        status,
        requires_manual_review,
        onboarding_configuration_id,
        timestamp,
    };
    ResponseData::ok(response).json()
}
