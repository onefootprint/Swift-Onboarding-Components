use crate::auth::session_context::HasUserVaultId;
use crate::auth::session_data::user::d2p::D2pSession;
use crate::auth::session_data::user::my_fp::My1fpBasicSession;
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::auth::session_data::SessionData;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::session::{AuthSession, HandoffRecord};
use crate::State;
use crate::{auth::either::EitherSession, utils::session::JsonSession};
use chrono::{Duration, Utc};
use newtypes::{D2pSessionStatus, SessionAuthToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct GenerateResponse {
    auth_token: SessionAuthToken,
}

#[api_v2_operation(tags(D2p))]
#[post("generate")]
/// Generates a new d2p session token for the currently authenticated user. The d2p session token
/// has a limited scope, and also includes some status metadata for syncing state across the phone
/// and desktop.
pub async fn handler(
    state: web::Data<State>,
    // TODO this should only allow a step-up my1fp auth
    // https://linear.app/footprint/issue/FP-664/build-step-up-auth
    user_auth: EitherSession<OnboardingSession, My1fpBasicSession>,
) -> actix_web::Result<Json<ApiResponseData<GenerateResponse>>, ApiError> {
    let session_data = SessionData::D2p(D2pSession {
        user_vault_id: user_auth.user_vault_id(),
        ..D2pSession::default()
    });

    let session_sealing_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let expires_in = Duration::minutes(3);
            let auth_token = AuthSession::create_sync(conn, &session_sealing_key, session_data, expires_in)?;
            // Also keep track of the status of the handoff session. We use a JsonSession keyed on
            // a hash of the auth token so both handoff clients can look up the status
            let handoff_record = HandoffRecord {
                status: D2pSessionStatus::Waiting,
            };
            let now = Utc::now();
            JsonSession::update_or_create(conn, &auth_token, &handoff_record, now + expires_in)?;
            Ok(auth_token)
        })
        .await??;

    Ok(Json(ApiResponseData {
        data: GenerateResponse { auth_token },
    }))
}
