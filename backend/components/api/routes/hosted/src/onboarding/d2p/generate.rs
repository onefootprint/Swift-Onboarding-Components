use crate::auth::user::UserAuthContext;
use crate::auth::user::{UserAuthGuard, UserAuthScope};
use crate::auth::AuthError;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::session::JsonSession;
use crate::utils::session::{AuthSession, HandoffRecord};
use crate::State;
use api_core::auth::IsGuardMet;
use api_wire_types::{D2pGenerateRequest, D2pGenerateResponse};
use chrono::{Duration, Utc};
use newtypes::D2pSessionStatus;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    operation_id = "hosted-onboarding-d2p-generate",
    tags(Hosted),
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
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    if UserAuthGuard::Handoff.is_met(&user_auth.data.scopes) {
        // Don't allow making a handoff token with an existing handoff token. This allows subverting
        // token expiry by constantly just making a new one
        return Err(AuthError::CannotCreateMultipleHandoffTokens.into());
    }
    let session_sealing_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let expires_in = Duration::minutes(10);
            let data = user_auth.data.add_scopes(vec![UserAuthScope::Handoff]);
            let auth_token = AuthSession::create_sync(conn, &session_sealing_key, data, expires_in)?;
            // Also keep track of the status of the handoff session. We use a JsonSession keyed on
            // a hash of the auth token so both handoff clients can look up the status
            let handoff_record = HandoffRecord {
                status: D2pSessionStatus::Waiting,
                // Allow embedding extra metadata in the backend session
                meta: request.and_then(|r| r.into_inner().meta),
            };
            let now = Utc::now();
            JsonSession::update_or_create(conn, &auth_token, &handoff_record, now + expires_in)?;
            Ok(auth_token)
        })
        .await??;

    Ok(Json(ResponseData {
        data: D2pGenerateResponse { auth_token },
    }))
}
