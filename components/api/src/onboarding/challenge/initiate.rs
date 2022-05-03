use crate::onboarding::seal;
use crate::response::success::ApiResponseData;
use crate::{auth::onboarding_session::OnboardingSessionContext, errors::ApiError};
use crate::{onboarding, State};
use db::models::session_data::{ChallengeType, OnboardingSessionData};
use db::models::sessions::UpdateSession;
use db::models::user_vaults::UpdateUserVault;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};
use uuid::Uuid;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
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

    // initiate challenge data & update struct for challenge kind
    let (challenge_type, update) = match request.kind {
        ChallengeKind::Email => {
            let email = crate::onboarding::clean_email(request.data.clone());
            (
                // TODO don't store decrypted PII in session store
                ChallengeType::Email(email.clone()),
                UpdateUserVault {
                    id: user_vault.id.clone(),
                    sh_phone_number: Some(crate::onboarding::hash(email.clone())),
                    is_email_verified: Some(false),
                    e_email: Some(seal(email, user_vault)?),
                    ..Default::default()
                },
            )
        }
        ChallengeKind::Sms => {
            let phone = onboarding::clean_phone_number(&state, &request.data.clone()).await?;
            (
                ChallengeType::PhoneNumber(phone.clone()),
                UpdateUserVault {
                    id: user_vault.id.clone(),
                    sh_phone_number: Some(crate::onboarding::hash(phone.clone())),
                    is_phone_number_verified: Some(false),
                    e_phone_number: Some(seal(phone, user_vault)?),
                    ..Default::default()
                },
            )
        }
    };

    let challenge_data =
        crate::onboarding::challenge::lib::initiate(&state, challenge_type).await?;
    // TODO it would be nice to update the session data before sending the email
    // so we don't send the email and then crash before the challenge has been saved to the DB
    // TODO make this atomic with the user vault update, otherwise we could mark
    // a different phone number as verified in the verification flow
    let session_data = UpdateSession {
        h_session_id: session_info.h_session_id.clone(),
        session_data: db::models::session_data::SessionState::OnboardingSession(
            OnboardingSessionData {
                user_ob_id: onboarding.user_ob_id.clone(),
                challenge_data: challenge_data.clone(),
            },
        ),
    };
    // force overwrites previous challenges from this session
    let _: usize = db::session::update(&state.db_pool, session_data).await?;
    let _: usize = db::user_vault::update(&state.db_pool, update).await?;

    Ok(Json(ApiResponseData {
        data: "Successfully sent challenge".to_string(),
    }))
}
