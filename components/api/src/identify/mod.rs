pub mod commit;
pub mod data;
pub mod init;
pub mod verify;

use crate::errors::ApiError;
use crate::State;
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
    raw_email
}

pub fn routes() -> web::Scope {
    web::scope("/identify")
        .service(web::resource("").route(web::post().to(init::handler)))
        .service(verify::handler)
        .service(data::handler)
        .service(commit::handler)
}
