use crate::auth::session_data::user::{UserAuthScope, UserSession};
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::utils::session::JsonSession;
use crate::utils::session::{AuthSession, HandoffRecord};
use crate::State;
use chrono::{Duration, Utc};
use newtypes::{D2pSessionStatus, SessionAuthToken};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct GenerateResponse {
    auth_token: SessionAuthToken,
}

#[api_v2_operation(tags(Hosted))]
#[post("generate")]
/// Generates a new d2p session token for the currently authenticated user. The d2p session token
/// has a limited scope, and also includes some status metadata for syncing state across the phone
/// and desktop.
pub async fn handler(
    state: web::Data<State>,
    user_auth: UserAuth,
) -> actix_web::Result<Json<ApiResponseData<GenerateResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;

    let session_sealing_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let expires_in = Duration::minutes(3);
            let data = UserSession::create(user_auth.user_vault_id(), vec![UserAuthScope::Handoff]);
            let auth_token = AuthSession::create_sync(conn, &session_sealing_key, data, expires_in)?;
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
