use crate::auth::session_data::tenant::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::validate_user::ValidateUserToken;
use crate::auth::session_data::{ServerSession, SessionData};
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use chrono::NaiveDateTime;
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
    timestamp: NaiveDateTime,
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

    let ValidateUserToken { onboarding_id } = if let SessionData::ValidateUserToken(data) = session.data {
        Ok(data)
    } else {
        Err(ApiError::from(OnboardingError::ValidateTokenInvalidOrNotFound))
    }?;

    let onboarding = db::onboarding::get_by_onboarding_id_and_tenant(
        &state.db_pool,
        onboarding_id,
        auth.tenant().id.clone(),
    )
    .await?;

    Ok(Json(ApiResponseData::ok(ValidateResponse {
        onboarding_configuration_id: onboarding.ob_config_id,
        footprint_user_id: onboarding.user_ob_id,
        status: onboarding.status,
        timestamp: onboarding.start_timestamp,
    })))
}
