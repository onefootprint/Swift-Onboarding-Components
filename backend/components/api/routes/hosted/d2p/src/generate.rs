use crate::auth::user::UserAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::session::{
    HandoffRecord,
    JsonSession,
};
use crate::State;
use api_core::auth::session::user::{
    NewUserSessionContext,
    TokenCreationPurpose,
};
use api_core::errors::ApiResult;
use api_wire_types::{
    D2pGenerateRequest,
    D2pGenerateResponse,
};
use chrono::Duration;
use newtypes::{
    D2pSessionStatus,
    UserAuthScope,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

#[api_v2_operation(
    operation_id = "hosted-onboarding-d2p-generate",
    tags(D2p, Hosted),
    description = "Generates a new d2p session token for the currently authenticated user. The d2p \
    session token has a limited scope, and also includes some status metadata for syncing state \
    across the phone and desktop."
)]
#[post("/hosted/onboarding/d2p/generate")]
pub async fn handler(
    state: web::Data<State>,
    // Option for backwards compatibility
    request: Option<web::Json<D2pGenerateRequest>>,
    user_auth: UserAuthContext,
) -> actix_web::Result<Json<ResponseData<D2pGenerateResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let session_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let limit_ttl = Duration::minutes(30);
            let args = NewUserSessionContext::default();
            let session = user_auth.update(
                args,
                vec![UserAuthScope::Handoff],
                TokenCreationPurpose::Handoff,
                None,
            )?;
            let (auth_token, expires_at) =
                user_auth.create_derived(conn, &session_key, session, Some(limit_ttl))?;
            // Also keep track of the status of the handoff session. We use a JsonSession keyed on
            // a hash of the auth token so both handoff clients can look up the status
            let handoff_record = HandoffRecord {
                status: D2pSessionStatus::Waiting,
                // Allow embedding extra metadata in the backend session
                meta: request.and_then(|r| r.into_inner().meta),
            };
            JsonSession::update_or_create(conn, &auth_token, &handoff_record, expires_at)?;
            Ok(auth_token)
        })
        .await?;

    Ok(Json(ResponseData {
        data: D2pGenerateResponse { auth_token },
    }))
}
