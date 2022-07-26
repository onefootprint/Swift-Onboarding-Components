use crate::auth::either::EitherSession;
use crate::auth::session_context::HasUserVaultId;
use crate::auth::session_data::user::d2p::D2pSession;
use crate::auth::session_data::user::my_fp::My1fpBasicSession;
use crate::auth::session_data::user::onboarding::OnboardingSession;
use crate::auth::session_data::SessionData;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::session::AuthSession;
use crate::State;
use chrono::Duration;
use newtypes::SessionAuthToken;
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

    let auth_token = AuthSession::create(&state, session_data, Duration::minutes(3)).await?;

    Ok(Json(ApiResponseData {
        data: GenerateResponse { auth_token },
    }))
}
