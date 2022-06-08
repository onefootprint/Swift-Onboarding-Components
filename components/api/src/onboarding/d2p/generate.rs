use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use chrono::{Duration, Utc};
use db::models::sessions::Session;
use newtypes::user::d2p::D2pSession;
use newtypes::user::onboarding::OnboardingSession;
use newtypes::ServerSession;
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
pub async fn handler(
    state: web::Data<State>,
    user_auth: SessionContext<OnboardingSession>,
) -> actix_web::Result<Json<ApiResponseData<GenerateResponse>>, ApiError> {
    let temp_token_expires_at = Utc::now().naive_utc() + Duration::minutes(3);
    let session_data = ServerSession::D2p(D2pSession {
        user_vault_id: user_auth.data.user_vault_id,
        ..D2pSession::default()
    });
    let (_, auth_token) = Session::create(&state.db_pool, session_data, temp_token_expires_at).await?;

    Ok(Json(ApiResponseData {
        data: GenerateResponse { auth_token },
    }))
}
