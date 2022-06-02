use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use chrono::{Duration, Utc};
use db::models::session_data::{LoggedInSessionData, SessionState as DbSessionState};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct GenerateResponse {
    auth_token: String,
}

#[api_v2_operation(tags(D2p))]
#[post("generate")]
/// Generates a new d2p session token for the currently authenticated user. The d2p session token
/// has a limited scope, and also includes some status metadata for syncing state across the phone
/// and desktop.
pub fn handler(
    state: web::Data<State>,
    user_auth: LoggedInSessionContext,
) -> actix_web::Result<Json<ApiResponseData<GenerateResponse>>, ApiError> {
    let uv = user_auth.user_vault();

    let temp_token_expires_at = Utc::now().naive_utc() + Duration::minutes(3);
    let (_, auth_token) = DbSessionState::LoggedInSession(LoggedInSessionData {
        user_vault_id: uv.id.clone(),
    })
    .create(&state.db_pool, temp_token_expires_at)
    .await?;

    Ok(Json(ApiResponseData {
        data: GenerateResponse {
            auth_token: auth_token,
        },
    }))
}
