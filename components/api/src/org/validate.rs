use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::validate_user::ValidateUserToken;
use crate::auth::session_data::{ServerSession, SessionData};
use crate::auth::IsLive;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use chrono::{DateTime, Utc};
use db::models::scoped_users::Onboarding;
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

#[api_v2_operation(tags(Org))]
#[post("/validate")]
/// Allows a tenant to view a customer's registered webauthn creden&tials
pub fn validate(
    state: web::Data<State>,
    request: web::Json<ValidateRequest>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ApiResponseData<ValidateResponse>>, ApiError> {
    let session =
        db::session::get_session_by_auth_token(&state.db_pool, request.into_inner().validation_token)
            .await?
            .ok_or(OnboardingError::ValidateTokenInvalidOrNotFound)?;

    let session = ServerSession::unseal(&state.session_sealing_key, &session.sealed_session_data)?;

    let ValidateUserToken { ob_id } = if let SessionData::ValidateUserToken(data) = session.data {
        data
    } else {
        return Err(OnboardingError::ValidateTokenInvalidOrNotFound.into());
    };

    let (ob, scoped_user) = Onboarding::get_by_id(&state.db_pool, ob_id)
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
