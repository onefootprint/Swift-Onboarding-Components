use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::validate_user::ValidateUserToken;
use crate::auth::session_data::AuthSessionData;
use crate::auth::IsLive;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::utils::session::AuthSession;
use crate::State;
use chrono::{DateTime, Utc};
use db::models::onboardings::Onboarding;
use newtypes::{FootprintUserId, ObConfigurationId, SessionAuthToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

/// Validate a short lived token to get the footprint user id
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, Apiv2Schema)]
pub struct ValidateRequest {
    validation_token: SessionAuthToken,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ValidateResponse {
    onboarding_configuration_id: ObConfigurationId,
    footprint_user_id: FootprintUserId,
    status: newtypes::Status,
    timestamp: DateTime<Utc>,
}

#[api_v2_operation(tags(Org, Users))]
#[post("/validate")]
/// Allows a tenant to view a customer's registered webauthn credentials
pub fn validate(
    state: web::Data<State>,
    request: web::Json<ValidateRequest>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<ValidateResponse>>, ApiError> {
    let session = AuthSession::get(&state, &request.validation_token)
        .await?
        .ok_or(OnboardingError::ValidateTokenInvalidOrNotFound)?
        .data;

    let ValidateUserToken { ob_id } = if let AuthSessionData::ValidateUserToken(data) = session {
        data
    } else {
        return Err(OnboardingError::ValidateTokenInvalidOrNotFound.into());
    };

    let (ob, scoped_user) = Onboarding::get(&state.db_pool, ob_id)
        .await?
        .ok_or(OnboardingError::NoOnboarding)?;
    if scoped_user.tenant_id != auth.tenant().id {
        return Err(OnboardingError::TenantMismatch.into());
    }
    if scoped_user.is_live != auth.is_live()? {
        return Err(OnboardingError::InvalidSandboxState.into());
    }

    Ok(Json(ApiResponseData::ok(ValidateResponse {
        onboarding_configuration_id: ob.ob_configuration_id,
        footprint_user_id: scoped_user.fp_user_id,
        status: ob.status,
        timestamp: scoped_user.start_timestamp,
    })))
}
