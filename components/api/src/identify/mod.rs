pub mod challenge;
pub mod identify;
pub mod verify;

use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::phone::send_sms;
use crate::{errors::ApiError, State};
use chrono::{Duration, Utc};
use crypto::b64::Base64Data;
use crypto::sha256;
use db::models::session_data::{ChallengeLastSentData, SessionState};
use newtypes::UserVaultId;
use paperclip::actix::{web, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum CreateChallengeRequest {
    Email(String),
    PhoneNumber(String),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum ChallengeKind {
    Sms,
    Biometric,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PhoneChallengeState {
    pub phone_number: String,
    pub h_code: Vec<u8>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BiometricChallengeState {
    pub state: webauthn_rs::AuthenticationState,
    pub user_vault_id: UserVaultId,
}

pub(crate) async fn send_phone_challenge(
    state: &web::Data<State>,
    phone_number: String,
) -> Result<ChallengeToken, ApiError> {
    // 555-01* numbers are reserved / not real, we use these for integration testing with a known code
    let phone_number_digits: String = phone_number.clone().chars().skip(5).take(5).collect();
    let is_test_phone_number = phone_number_digits.as_str() == "55501";

    // Limit how frequently we send a phone challenge to the same number
    let h_phone_number =
        Base64Data(sha256((phone_number.clone() + "_sms_challenge").as_bytes()).to_vec())
            .to_string();
    let now = Utc::now().naive_utc();
    let time_between_challenges = state.config.time_s_between_sms_challenges;
    if !is_test_phone_number {
        let session =
            db::session::get_by_h_session_id(&state.db_pool, h_phone_number.clone()).await?;
        if let Some(session) = session {
            if let SessionState::ChallengeLastSent(data) = session.session_data {
                if (now - data.sent_at) < chrono::Duration::seconds(time_between_challenges) {
                    return Err(ApiError::WaitToSendChallenge(time_between_challenges));
                }
            }
        }
    }
    db::models::sessions::NewSession {
        h_session_id: h_phone_number.clone(),
        session_data: SessionState::ChallengeLastSent(ChallengeLastSentData { sent_at: now }),
        expires_at: now + Duration::seconds(time_between_challenges),
    }
    .update_or_create(&state.db_pool)
    .await?;

    // send challenge & set state
    let code = if is_test_phone_number {
        "123456".to_owned()
    } else {
        crypto::random::gen_rand_n_digit_code(6)
    };
    let message_body = format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code.clone(), code.clone());

    send_sms(state, phone_number.clone(), message_body).await?;

    let challenge = Challenge {
        expires_at: Utc::now().naive_utc() + Duration::minutes(15),
        data: PhoneChallengeState {
            phone_number,
            h_code: sha256(code.as_bytes()).to_vec(),
        },
    };
    let challenge_token = challenge.seal(&state.session_sealing_key)?;
    Ok(challenge_token)
}

pub fn routes() -> web::Scope {
    web::scope("/identify")
        .service(web::resource("").route(web::post().to(identify::handler)))
        .service(challenge::handler)
        .service(verify::handler)
}
