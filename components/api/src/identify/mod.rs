pub mod challenge;
pub mod commit;
pub mod data;
pub mod email_verify;
pub mod init;
mod livecheck;
pub mod verify;

use crate::auth::identify_session::ChallengeState;
use crate::State;
use crate::{auth::identify_session::IdentifySessionState, errors::ApiError};
use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination,
    EmailContent, Message as EmailMessage,
};
use chrono::{NaiveDateTime, Utc};
use crypto::b64::Base64Data;
use crypto::seal::EciesP256Sha256AesGcmSealed;
use crypto::sha256;
use db::models::user_vaults::UserVault;
use paperclip::actix::{web, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum CreateChallengeRequest {
    Email(String),
    PhoneNumber(String),
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifyChallenge {
    pub expires_at: NaiveDateTime,
    pub email: String,
}

fn hash(val: String) -> Vec<u8> {
    // TODO hmac
    sha256(val.as_bytes()).to_vec()
}

fn seal_untyped(val: String, pub_key: &[u8]) -> Result<EciesP256Sha256AesGcmSealed, ApiError> {
    let val = crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
        pub_key,
        val.as_str().as_bytes().to_vec(),
    )?;
    Ok(val)
}
fn seal(val: String, pub_key: &[u8]) -> Result<Vec<u8>, ApiError> {
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

async fn decrypt_and_send_challenge(
    state: &web::Data<State>,
    vault: UserVault,
    tenant_id: String,
    email: String,
) -> Result<(IdentifySessionState, String), ApiError> {
    let decrypted_data = crate::enclave::lib::decrypt_bytes(
        state,
        &vault.e_phone_number,
        vault.e_private_key.clone(),
        enclave_proxy::DataTransform::Identity,
    )
    .await?;
    // send challenge & set state
    let phone_number = std::str::from_utf8(&decrypted_data)?.to_string();
    send_challenge(state, phone_number.clone(), tenant_id, email).await
}

pub(crate) async fn send_challenge(
    state: &web::Data<State>,
    phone_number: String,
    tenant_id: String,
    email: String,
) -> Result<(IdentifySessionState, String), ApiError> {
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

    Ok((
        IdentifySessionState {
            tenant_id,
            email,
            challenge_state: Some(ChallengeState {
                phone_number: phone_number.clone(),
                challenge_code: code,
                challenge_created_at: Utc::now().naive_utc(),
            }),
        },
        phone_number.chars().skip(10).take(2).collect(),
    ))
}

pub(crate) async fn send_email_challenge(
    state: &web::Data<State>,
    public_key: Vec<u8>,
    email_address: String,
    sh_email: Vec<u8>,
) -> Result<(), ApiError> {
    let now = chrono::Utc::now().naive_utc();
    let email_challenge_data = EmailVerifyChallenge {
        expires_at: now + chrono::Duration::days(1),
        email: email_address.clone(),
    };
    let email_challenge_data_str =
        serde_json::to_string::<EmailVerifyChallenge>(&email_challenge_data)
            .map_err(|_| ApiError::ChallengeNotValid)?;
    let e_email_challenge =
        seal_untyped(email_challenge_data_str.clone(), &public_key)?.to_string()?;

    let curl_request_str = format!(
        "https://verify.ui.footprint.dev/?sh_email={}&e_email_challenge={}",
        Base64Data(sh_email),
        e_email_challenge,
    );
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
        .service(web::resource("").route(web::post().to(init::handler)))
        .service(challenge::handler)
        .service(verify::handler)
        .service(data::handler)
        .service(commit::handler)
        .service(email_verify::handler)
        .service(livecheck::handler)
}
