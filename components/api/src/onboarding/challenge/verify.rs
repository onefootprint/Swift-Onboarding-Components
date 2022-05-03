use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::onboarding_session::OnboardingSessionContext, errors::ApiError};
use chrono::{Duration, Utc};
use db::models::session_data::{ChallengeType, SessionState};
use db::models::types::Status;
use db::models::user_vaults::{UpdateUserVault, UserVault};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct ChallengeVerifyRequest {
    code: String,
}

#[api_v2_operation]
#[post("/verify")]
async fn handler(
    state: web::Data<State>,
    session_context: OnboardingSessionContext,
    request: Json<ChallengeVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    let user_vault = session_context.user_vault();
    let session_data = session_context.session_info();

    let (stored_h_code, challenge_type, created_at) = match session_data.clone().session_data {
        SessionState::OnboardingSession(s) => Ok((
            s.challenge_data.h_challenge_code,
            s.challenge_data.challenge_type,
            s.challenge_data.created_at,
        )),
        // todo, handle identify
        _ => Err(ApiError::ChallengeDataNotSet),
    }?;

    let now = Utc::now().naive_utc();
    let request_h_code = crypto::sha256(request.code.as_bytes()).to_vec();

    if (stored_h_code == request_h_code)
        & (created_at.signed_duration_since(now) > Duration::minutes(5))
    {
        let update = create_user_vault_update(&challenge_type, user_vault);
        db::user_vault::update(&state.db_pool, update).await?;
        Ok(Json(ApiResponseData {
            data: "Challenge validated and information and published to user vault".to_string(),
        }))
    } else {
        Err(ApiError::ChallengeNotValid)
    }
}

fn create_user_vault_update(t: &ChallengeType, vault: &UserVault) -> UpdateUserVault {
    // TODO validate that we are verifying the same contact info on user vault
    UpdateUserVault {
        id: vault.id.clone(),
        is_email_verified: match t {
            ChallengeType::Email(_) => Some(true),
            _ => None,
        },
        is_phone_number_verified: match t {
            ChallengeType::PhoneNumber(_) => Some(true),
            _ => None,
        },
        id_verified: Status::Processing,
        ..Default::default()
    }
}
