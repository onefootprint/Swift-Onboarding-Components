use crate::auth::user::UserAuthContext;
use crate::errors::handoff::HandoffError;
use crate::errors::ApiError;
use crate::utils::session::{
    HandoffRecord,
    JsonSession,
};
use crate::State;
use api_core::auth::user::UserAuthScope;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::types::ModernApiResult;
use api_wire_types::{
    D2pStatusResponse,
    D2pUpdateStatusRequest,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    api_v2_operation,
    get,
    post,
    web,
};

#[api_v2_operation(
    operation_id = "hosted-onboarding-d2p-status",
    tags(D2p, Hosted),
    description = "Gets the status of the provided d2p session. Requires the d2p session token as the auth header."
)]
#[get("/hosted/onboarding/d2p/status")]
pub async fn get(state: web::Data<State>, user_auth: UserAuthContext) -> ModernApiResult<D2pStatusResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::Handoff)?;

    let session = state
        .db_pool
        .db_query(move |conn| JsonSession::<HandoffRecord>::get(conn, &user_auth.auth_token))
        .await?
        .ok_or(HandoffError::HandoffSessionNotFound)?;
    Ok(D2pStatusResponse {
        status: session.data.status,
        meta: session.data.meta,
    })
}

#[api_v2_operation(
    operation_id = "hosted-onboarding-d2p-status-post",
    tags(D2p, Hosted),
    description = "Update the status of the provided d2p session. Only allows updating to certain statuses."
)]
#[post("/hosted/onboarding/d2p/status")]
pub async fn post(
    user_auth: UserAuthContext,
    request: Json<D2pUpdateStatusRequest>,
    state: web::Data<State>,
) -> ModernApiResult<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::Handoff)?;

    let D2pUpdateStatusRequest { status } = request.into_inner();
    state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            // TODO lock session
            let session = JsonSession::<HandoffRecord>::get(conn, &user_auth.auth_token)?
                .ok_or(HandoffError::HandoffSessionNotFound)?;
            if status == session.data.status {
                // No-op when the status is already updated
                return Ok(());
            }
            if status.priority() <= session.data.status.priority() {
                return Err(ErrorWithCode::InvalidStatusTransition.into());
            }
            let handoff_record = HandoffRecord {
                status,
                // Don't change the meta session data
                meta: session.data.meta,
            };
            JsonSession::update_or_create(conn, &user_auth.auth_token, &handoff_record, session.expires_at)?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
