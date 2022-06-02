use crate::auth::{logged_in_session::LoggedInSessionContext, AuthError};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use db::models::session_data::LoggedInSessionKind;
use newtypes::D2pSessionStatus;
use paperclip::actix::{api_v2_operation, get, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct StatusResponse {
    status: D2pSessionStatus,
}

#[api_v2_operation(tags(D2p))]
#[get("status")]
/// Gets the status of the provided d2p session. Requires the d2p session token as the auth header.
pub fn handler(
    user_auth: LoggedInSessionContext,
) -> actix_web::Result<Json<ApiResponseData<StatusResponse>>, ApiError> {
    let d2p_session_data = match &user_auth.session_data().kind {
        LoggedInSessionKind::D2pSession(d2p_session_data) => d2p_session_data,
        _ => return Err(AuthError::SessionTypeError).map_err(ApiError::from),
    };

    Ok(Json(ApiResponseData {
        data: StatusResponse {
            status: d2p_session_data.status,
        },
    }))
}
