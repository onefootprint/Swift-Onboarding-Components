pub mod challenge;
pub mod identify;
pub mod verify;

use std::str::FromStr;

use crate::signed_hash;
use crate::utils::challenge::Challenge;
use crate::{errors::ApiError, State};
use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination,
    EmailContent, Message as EmailMessage,
};
use aws_sdk_pinpointsmsvoicev2::output::SendTextMessageOutput;
use chrono::NaiveDateTime;
use chrono::{Duration, Utc};
use crypto::b64::Base64Data;
use crypto::{serde_cbor, sha256};
use db::models::session_data::{ChallengeLastSentData, SessionState};
use db::models::user_vaults::{UserVault, UserVaultWrapper};
use newtypes::{DataKind, UserVaultId};
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifyChallenge {
    pub expires_at: NaiveDateTime,
    pub email: String,
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

// TODO move these utils somewhere else
pub async fn signed_hash(state: &web::Data<State>, val: String) -> Result<Vec<u8>, ApiError> {
    state.hmac_client.signed_hash(val.as_bytes()).await
}

pub fn seal(val: String, pub_key: &[u8]) -> Result<Vec<u8>, ApiError> {
    let val = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
        pub_key,
        val.as_str().as_bytes().to_vec(),
    )?
    .to_vec()?;
    Ok(val)
}

pub(crate) async fn clean_phone_number(
    state: &web::Data<State>,
    raw_phone_number: &str,
) -> Result<String, ApiError> {
    let req = aws_sdk_pinpoint::model::NumberValidateRequest::builder()
        .phone_number(raw_phone_number)
        .build();
    let validated_phone_number = state
        .pinpoint_client
        .phone_number_validate()
        .number_validate_request(req)
        .send()
        .await?
        .number_validate_response
        .ok_or(ApiError::PhoneNumberValidationError)?
        .cleansed_phone_number_e164
        .ok_or(ApiError::PhoneNumberValidationError)?;
    Ok(validated_phone_number)
}

pub fn clean_email(raw_email: String) -> String {
    raw_email.to_lowercase()
}

pub(crate) async fn send_phone_challenge(
    state: &web::Data<State>,
    phone_number: String,
) -> Result<String, ApiError> {
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
    let _: SendTextMessageOutput = state.sms_client.send_text_message()
            .origination_identity("+17655634600".to_owned())
            .destination_phone_number(phone_number.clone())
            .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code.clone(), code.clone()))
            .send()
            .await?;

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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifyData {
    pub sh_email: Vec<u8>,
    pub e_email_challenge: Vec<u8>,
}

impl EmailVerifyData {
    pub fn serialize(&self) -> Result<String, ApiError> {
        let email_verify_data = serde_cbor::to_vec(self).map_err(crypto::Error::from)?;
        Ok(Base64Data(email_verify_data).to_string())
    }

    pub fn deserialize(data: String) -> Result<EmailVerifyData, ApiError> {
        let data_slice = Base64Data::from_str(&data).map_err(crypto::Error::from)?.0;
        let email_verify_data: EmailVerifyData =
            serde_cbor::from_slice(&data_slice).map_err(crypto::Error::from)?;
        Ok(email_verify_data)
    }
}

pub(crate) async fn send_email_challenge(
    state: &web::Data<State>,
    public_key: Vec<u8>,
    email_address: String,
) -> Result<(), ApiError> {
    let email_challenge = EmailVerifyChallenge {
        expires_at: chrono::Utc::now().naive_utc() + chrono::Duration::days(1),
        email: email_address.clone(),
    };
    let email_challenge = serde_json::to_string::<EmailVerifyChallenge>(&email_challenge)
        .map_err(|_| ApiError::ChallengeNotValid)?;
    let email_verify_data = EmailVerifyData {
        sh_email: signed_hash(state, email_address.clone()).await?,
        e_email_challenge: seal(email_challenge, &public_key)?,
    }
    .serialize()?;

    let curl_request_str = format!("https://verify.ui.footprint.dev/#{}", email_verify_data,);
    let content = build_email_challenge_content_body(curl_request_str);
    let _output = state
        .email_client
        .send_email()
        .destination(
            EmailDestination::builder()
                .to_addresses(email_address)
                .build(),
        )
        .from_email_address("noreply@infra.footprint.dev")
        .content(content)
        .send()
        .await?;
    Ok(())
}

fn build_email_challenge_content_body(contents: String) -> EmailContent {
    let body_text = EmailStringContent::builder()
        .data(format!("Hello from footprint!\nYou can issue this curl request to mark your email as verified:\n\n{}", contents))
        .build();
    let body_html = EmailStringContent::builder()
        .data(format!(
            "<h1>Hello from footprint!</h1><br>You can issue this curl request to mark your email as verified:<br><br><tt>{}</tt>",
            contents,
        ))
        .build();
    let body = EmailBody::builder().text(body_text).html(body_html).build();
    let message = EmailMessage::builder()
        .subject(
            EmailStringContent::builder()
                .data("Hello from Footprint!")
                .build(),
        )
        .body(body)
        .build();
    EmailContent::builder().simple(message).build()
}

pub fn routes() -> web::Scope {
    web::scope("/identify")
        .service(web::resource("").route(web::post().to(identify::handler)))
        .service(challenge::handler)
        .service(verify::handler)
}
