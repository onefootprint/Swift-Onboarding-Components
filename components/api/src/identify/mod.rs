pub mod challenge;
pub mod commit;
pub mod data;
pub mod init;
pub mod verify;
use crate::auth::identify_session::ChallengeState;
use crate::State;
use crate::{auth::identify_session::IdentifySessionState, errors::ApiError};
use chrono::Utc;
use crypto::sha256;
use paperclip::actix::{web, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CreateChallengeRequest {
    Email(String),
    PhoneNumber(String),
}

fn hash(val: String) -> Vec<u8> {
    // TODO hmac
    sha256(val.as_bytes()).to_vec()
}

fn seal(val: String, pub_key: &[u8]) -> Result<Vec<u8>, ApiError> {
    let val = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
        pub_key,
        val.as_str().as_bytes().to_vec(),
    )?
    .to_vec()?;
    Ok(val)
}

pub async fn clean_phone_number(
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

pub(crate) async fn send_challenge(
    state: &web::Data<State>,
    phone_number: String,
    tenant_id: String,
    email: String,
) -> Result<IdentifySessionState, ApiError> {
    // 555-01* numbers are reserved / not real, we use these for integration testing with a known code
    let phone_number_digits: String = phone_number.clone().chars().skip(5).take(5).collect();
    let code = match phone_number_digits.as_str() {
        "55501" => "123456".to_owned(),
        _ => crypto::random::gen_rand_n_digit_code(6),
    };

    // send challenge & set state
    let _ = state.sms_client.send_text_message()
            .destination_phone_number(phone_number.clone())
            .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code.clone(), code.clone()))
            .send()
            .await?;

    Ok(IdentifySessionState {
        tenant_id,
        email,
        challenge_state: Some(ChallengeState {
            phone_number: phone_number.clone(),
            challenge_code: code,
            challenge_created_at: Utc::now().naive_utc(),
        }),
    })
}

pub fn routes() -> web::Scope {
    web::scope("/identify")
        .service(web::resource("").route(web::post().to(init::handler)))
        .service(challenge::handler)
        .service(verify::handler)
        .service(data::handler)
        .service(commit::handler)
}
