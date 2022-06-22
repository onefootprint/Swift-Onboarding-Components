use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use db::models::sessions::Session;
use newtypes::user::d2p::D2pSession;
use newtypes::{D2pSessionStatus, ServerSession};
use paperclip::actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct StatusResponse {
    status: D2pSessionStatus,
}

#[api_v2_operation(tags(D2p))]
#[get("status")]
/// Gets the status of the provided d2p session. Requires the d2p session token as the auth header.
pub fn get(
    user_auth: SessionContext<D2pSession>,
) -> actix_web::Result<Json<ApiResponseData<StatusResponse>>, ApiError> {
    Ok(Json(ApiResponseData {
        data: StatusResponse {
            status: user_auth.data.status,
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
    user_auth: SessionContext<D2pSession>,
    request: Json<UpdateStatusRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
    let UpdateStatusRequest { status } = request.into_inner();
    if status.priority() <= user_auth.data.status.priority() {
        return Err(ApiError::InvalidStatusTransition);
    }

    let session_data = ServerSession::D2p(D2pSession {
        user_vault_id: user_auth.data.user_vault_id,
        status,
    });
    Session::update(&state.db_pool, Some(session_data), user_auth.auth_token, None).await?;

    Ok(Json(ApiResponseData { data: Empty }))
}
