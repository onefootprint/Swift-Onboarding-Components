use crate::auth::{onboarding_session::OnboardingSessionContext, AuthError};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::State;
use db::models::session_data::onboarding::OnboardingSessionKind;
use db::models::session_data::SessionState;
use newtypes::D2pSessionStatus;
use paperclip::actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct StatusResponse {
    status: D2pSessionStatus,
}

#[api_v2_operation(tags(D2p))]
#[get("status")]
/// Gets the status of the provided d2p session. Requires the d2p session token as the auth header.
pub fn get(
    user_auth: OnboardingSessionContext,
) -> actix_web::Result<Json<ApiResponseData<StatusResponse>>, ApiError> {
    let d2p_session_data = match &user_auth.session_data().kind {
        OnboardingSessionKind::D2pSession(d2p_session_data) => d2p_session_data,
        _ => return Err(AuthError::SessionTypeError).map_err(ApiError::from),
    };

    Ok(Json(ApiResponseData {
        data: StatusResponse {
            status: d2p_session_data.status.clone(),
        },
    }))
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateStatusRequest {
    status: D2pSessionStatus,
}

#[api_v2_operation(tags(D2p))]
#[post("status")]
/// Update the status of the provided d2p session. Only allows updating to certain statuses
pub fn post(
    user_auth: OnboardingSessionContext,
    request: Json<UpdateStatusRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let d2p_session_data = match &user_auth.session_data().kind {
        OnboardingSessionKind::D2pSession(d2p_session_data) => d2p_session_data,
        _ => return Err(AuthError::SessionTypeError).map_err(ApiError::from),
    };

    let UpdateStatusRequest { status } = request.into_inner();
    if status.priority() <= d2p_session_data.status.priority() {
        return Err(ApiError::InvalidStatusTransition);
    }

    SessionState::OnboardingSession(user_auth.session_data().clone().replace(status.into()))
        .update(&state.db_pool, user_auth.auth_token)
        .await?;

    Ok(Json(ApiResponseData { data: Empty }))
}
