use crate::auth::session_data::user::d2p::D2pSession;
use crate::errors::handoff::HandoffError;
use crate::types::success::ApiResponseData;
use crate::types::Empty;
use crate::utils::session::{HandoffRecord, JsonSession};
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use newtypes::D2pSessionStatus;
use paperclip::actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct StatusResponse {
    status: D2pSessionStatus,
}

#[api_v2_operation(tags(D2p))]
#[get("status")]
/// Gets the status of the provided d2p session. Requires the d2p session token as the auth header.
pub async fn get(
    state: web::Data<State>,
    user_auth: SessionContext<D2pSession>,
) -> actix_web::Result<Json<ApiResponseData<StatusResponse>>, ApiError> {
    let session = &state
        .db_pool
        .db_query(move |conn| JsonSession::<HandoffRecord>::get(conn, &user_auth.auth_token))
        .await??
        .ok_or(HandoffError::HandoffSessionNotFound)?;
    Ok(Json(ApiResponseData {
        data: StatusResponse {
            status: session.data.status,
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
    state
        .db_pool
        .db_query(move |conn| -> Result<_, HandoffError> {
            let session = JsonSession::<HandoffRecord>::get(conn, &user_auth.auth_token)?
                .ok_or(HandoffError::HandoffSessionNotFound)?;
            if status.priority() <= session.data.status.priority() {
                return Err(HandoffError::InvalidStatusTransition);
            }
            let handoff_record = HandoffRecord { status };
            JsonSession::update_or_create(conn, &user_auth.auth_token, &handoff_record, session.expires_at)?;
            Ok(())
        })
        .await??;

    Ok(Json(ApiResponseData { data: Empty }))
}
