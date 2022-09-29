use crate::auth::session::AuthSessionData;
use crate::auth::tenant::{SecretTenantAuthContext, VerifiedTenantAuth};
use crate::auth::user::ValidateUserToken;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::session::AuthSession;
use crate::State;
use chrono::{DateTime, Utc};
use db::models::onboarding::Onboarding;
use newtypes::{FootprintUserId, KycStatus, ObConfigurationId, SessionAuthToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

/// Validate a short lived token to get the footprint user id
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
pub struct ValidateRequest {
    validation_token: SessionAuthToken,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ValidateResponse {
    pub onboarding_configuration_id: ObConfigurationId,
    pub footprint_user_id: FootprintUserId,
    pub status: KycStatus,
    pub timestamp: DateTime<Utc>,
}

#[api_v2_operation(
    summary = "/users/validate",
    operation_id = "users-validate",
    description = "Allows a tenant to view a customer's registered webauthn credentials.",
    tags(PublicApi)
)]
#[post("/validate")]
pub async fn validate(
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

    let (ob, scoped_user) = state
        .db_pool
        .db_query(move |conn| Onboarding::get(conn, &ob_id))
        .await??;
    if scoped_user.tenant_id != auth.tenant().id {
        return Err(OnboardingError::TenantMismatch.into());
    }
    if scoped_user.is_live != auth.is_live()? {
        return Err(OnboardingError::InvalidSandboxState.into());
    }

    Ok(Json(ResponseData::ok(ValidateResponse {
        onboarding_configuration_id: ob.ob_configuration_id,
        footprint_user_id: scoped_user.fp_user_id,
        status: ob.kyc_status,
        timestamp: scoped_user.start_timestamp,
    })))
}
