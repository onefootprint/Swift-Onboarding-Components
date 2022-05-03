use crate::onboarding::seal;
use crate::response::success::ApiResponseData;
use crate::{auth::onboarding_session::OnboardingSessionContext, errors::ApiError};
use crate::{onboarding, State};
use chrono::Utc;
use db::models::session_data::{ChallengeData, ChallengeType, OnboardingSessionData};
use db::models::sessions::UpdateSession;
use db::models::user_vaults::UpdateUserVault;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};
use uuid::Uuid;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
enum ChallengeKind {
    Sms,
    Email,
    // TODO biometric
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct ChallengeInitRequest {
    kind: ChallengeKind,
    data: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct CreateChallengeResponse {
    id: Uuid,
}

#[api_v2_operation]
pub async fn handler(
    state: web::Data<State>,
    session_context: OnboardingSessionContext,
    request: Json<ChallengeInitRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    // todo -- clean for less db calls
    let session_info = session_context.session_info();
    let onboarding = session_context.onboarding();
    let user_vault = session_context.user_vault();

    let code: String = crypto::random::gen_rand_n_digit_code(6);
    let h_code = crypto::sha256(code.as_bytes()).to_vec();

    // initiate challenge data & update struct for challenge kind
    let (challenge_data, update) = match request.kind {
        ChallengeKind::Email => {
            let email = crate::onboarding::clean_email(request.data.clone());
            (
                ChallengeData {
                    challenge_type: ChallengeType::Email(email.clone()),
                    created_at: Utc::now().naive_utc(),
                    h_challenge_code: h_code,
                },
                UpdateUserVault {
                    id: user_vault.id.clone(),
                    sh_email: Some(crypto::sha256(email.clone().as_bytes()).to_vec()),
                    is_email_verified: Some(false),
                    e_email: Some(seal(email, user_vault)?),
                    ..Default::default()
                },
            )
        }
        ChallengeKind::Sms => {
            let phone = onboarding::clean_phone_number(&state, &request.data.clone()).await?;
            (
                ChallengeData {
                    challenge_type: ChallengeType::PhoneNumber(phone.clone()),
                    created_at: Utc::now().naive_utc(),
                    h_challenge_code: h_code,
                },
                UpdateUserVault {
                    id: user_vault.id.clone(),
                    sh_email: Some(crypto::sha256(phone.clone().as_bytes()).to_vec()),
                    is_email_verified: Some(false),
                    e_email: Some(seal(phone, user_vault)?),
                    ..Default::default()
                },
            )
        }
    };

    let session_data = UpdateSession {
        h_session_id: session_info.h_session_id.clone(),
        session_data: db::models::session_data::SessionState::OnboardingSession(
            OnboardingSessionData {
                user_ob_id: onboarding.user_ob_id.clone(),
                challenge_data: challenge_data.clone(),
            },
        ),
    };

    let _size = db::user_vault::update(&state.db_pool, update);

    // force overwrites previous challenges from this session
    let _ = db::session::update(&state.db_pool, session_data).await?;

    let _ = crate::onboarding::challenge::lib::challenge(&state, challenge_data, code).await?;

    Ok(Json(ApiResponseData {
        data: "Successfully sent challenge".to_string(),
    }))
}
