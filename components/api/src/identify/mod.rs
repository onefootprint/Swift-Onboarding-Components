pub mod challenge;
#[allow(clippy::module_inception)]
pub mod identify;
pub mod verify;

use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::phone::{rate_limit, send_sms};
use crate::{errors::ApiError, State};
use chrono::{Duration, Utc};
use crypto::sha256;
use newtypes::UserVaultId;
use paperclip::actix::{web, Apiv2Schema};
use webauthn_rs_core::proto::AuthenticationState;

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
    pub state: AuthenticationState,
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
    if !is_test_phone_number {
        rate_limit(state, phone_number.clone(), "sms_challenge").await?;
    }

    // send challenge & set state
    let code = if is_test_phone_number {
        "123456".to_owned()
    } else {
        crypto::random::gen_rand_n_digit_code(6)
    };
    let message_body = format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.", &code);

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
