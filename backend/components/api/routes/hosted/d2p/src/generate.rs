use crate::auth::user::UserAuthContext;
use crate::utils::session::HandoffRecord;
use crate::utils::session::JsonSession;
use crate::State;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::auth::IsGuardMet;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_wire_types::D2pGenerateRequest;
use api_wire_types::D2pGenerateResponse;
use chrono::Duration;
use newtypes::D2pSessionStatus;
use newtypes::UserAuthScope;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

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
) -> ApiResponse<D2pGenerateResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::Auth.or(UserAuthScope::SignUp))?;
    let session_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
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

    Ok(D2pGenerateResponse { auth_token })
}
