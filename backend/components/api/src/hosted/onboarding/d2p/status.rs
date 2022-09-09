use crate::auth::session_data::user::UserAuthScope;
use crate::auth::UserAuth;
use crate::errors::handoff::HandoffError;
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::types::EmptyResponse;
use crate::utils::session::{HandoffRecord, JsonSession};
use crate::State;
use newtypes::D2pSessionStatus;
use paperclip::actix::{api_v2_operation, get, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct StatusResponse {
    status: D2pSessionStatus,
}

#[api_v2_operation(
    summary = "/hosted/onboarding/d2p/status",
    operation_id = "hosted-onboarding-d2p-status",
    tags(Hosted),
    description = "Gets the status of the provided d2p session. Requires the d2p session token as the auth header."
)]
#[get("status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuth,
) -> actix_web::Result<Json<ApiResponseData<StatusResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::Handoff])?;

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

#[api_v2_operation(
    summary = "/hosted/onboarding/d2p/status",
    operation_id = "hosted-onboarding-d2p-status-post",
    tags(Hosted),
    description = "Update the status of the provided d2p session. Only allows updating to certain statuses."
)]
#[post("status")]
pub fn post(
    user_auth: UserAuth,
    request: Json<UpdateStatusRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::Handoff])?;

    let UpdateStatusRequest { status } = request.into_inner();
    state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let session = JsonSession::<HandoffRecord>::get(conn, &user_auth.auth_token)?
                .ok_or(HandoffError::HandoffSessionNotFound)?;
            if status.priority() <= session.data.status.priority() {
                return Err(HandoffError::InvalidStatusTransition.into());
            }
            let handoff_record = HandoffRecord { status };
            JsonSession::update_or_create(conn, &user_auth.auth_token, &handoff_record, session.expires_at)?;
            Ok(())
        })
        .await??;

    Ok(Json(EmptyResponse::ok()))
}
