use crate::auth::session::AuthSessionData;
use crate::auth::tenant::{SecretTenantAuthContext, TenantAuth};
use crate::auth::user::ValidateUserToken;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::session::AuthSession;
use crate::State;
use api_wire_types::{ValidateRequest, ValidateResponse};
use db::models::onboarding::Onboarding;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    description = "Validate a transient onboarding session token to exchange it for a long-lived Footprint user token",
    tags(Onboarding, PublicApi)
)]
#[post("/onboarding/session/validate")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<ValidateRequest>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ResponseData<ValidateResponse>>, ApiError> {
    let session = AuthSession::get(&state, &request.validation_token)
        .await?
        .ok_or(OnboardingError::ValidateTokenInvalidOrNotFound)?
        .data;

    let ValidateUserToken { ob_id } = if let AuthSessionData::ValidateUserToken(data) = session {
        data
    } else {
        return Err(OnboardingError::ValidateTokenInvalidOrNotFound.into());
    };

    let (ob, scoped_user, manual_review, _) = state
        .db_pool
        .db_query(move |conn| Onboarding::get(conn, &ob_id))
        .await??;
    if scoped_user.tenant_id != auth.tenant().id {
        return Err(OnboardingError::TenantMismatch.into());
    }
    if scoped_user.is_live != auth.is_live()? {
        return Err(OnboardingError::InvalidSandboxState.into());
    }

    let terminal_status = ob.status;
    if !terminal_status.is_complete() {
        return Err(OnboardingError::NonTerminalState.into());
    }

    Ok(Json(ResponseData::ok(ValidateResponse {
        onboarding_configuration_id: ob.ob_configuration_id,
        footprint_user_id: scoped_user.fp_user_id,
        requires_manual_review: manual_review.is_some(),
        status: terminal_status,
        timestamp: scoped_user.start_timestamp,
    })))
}
