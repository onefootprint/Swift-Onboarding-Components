pub mod commit;
pub mod data;
pub mod identify;
pub mod verify;

use crate::errors::ApiError;
use crate::State;
use chrono::Utc;
use crypto::sha256;
use db::models::{
    session_data::{ChallengeData, ChallengeType, OnboardingSessionData},
    sessions::{NewSession, Session},
};
use paperclip::actix::{web, Apiv2Schema};

use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination,
    EmailContent, Message as EmailMessage,
};

use self::identify::IdentifyRequest;

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

pub async fn initiate(
    state: &web::Data<State>,
    data: String,
    challenge_type: IdentifyRequest,
    h_session_id: String,
    tenant_id: String,
) -> Result<Session, ApiError> {
    // ggenerate random 6 digit code
    let code: String = crypto::random::gen_rand_n_digit_code(6);

    // send challenge
    let _ = send_challenge(state, data, challenge_type.clone(), code.clone()).await?;

    // initiate session info
    let session =
        init_session_for_challenge(state, code, challenge_type.clone(), h_session_id, tenant_id)
            .await?;

    Ok(session)
}

async fn send_challenge(
    state: &web::Data<State>,
    data: String,
    challenge_type: IdentifyRequest,
    code: String,
) -> Result<(), ApiError> {
    match challenge_type {
        IdentifyRequest::Email(_) => {
            let content = build_email_content_body(code.clone());
            let output = state
                .email_client
                .send_email()
                .destination(EmailDestination::builder().to_addresses(data).build())
                // TODO not my email
                .from_email_address("elliott@onefootprint.com")
                .content(content)
                .send()
                .await?;
            log::info!("output from sending email message {:?}", output);
            Ok(())
        }
        IdentifyRequest::PhoneNumber(_) => {
            let output = state.sms_client.send_text_message()
                .destination_phone_number(data)
                .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code.clone(), code.clone()))
                .send()
                .await?;
            log::info!("output from sending phone {:?}", output);
            Ok(())
        }
    }
}

fn build_email_content_body(code: String) -> EmailContent {
    let body_text = EmailStringContent::builder().data(format!("Hello from footprint!\n\nYour Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code)).build();
    let body_html = EmailStringContent::builder().data(format!("<h1>Hello from footprint!</h1><br><br>Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.<br><br>@onefootprint.com #{}", code, code)).build();
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

async fn init_session_for_challenge(
    state: &web::Data<State>,
    code: String,
    challenge_type: IdentifyRequest,
    h_session_id: String,
    tenant_id: String,
) -> Result<Session, ApiError> {
    // create challenge & store in session
    let h_code = crypto::sha256(code.as_bytes()).to_vec();
    let challenge_data = ChallengeData {
        tenant_id,
        challenge_type: match challenge_type {
            IdentifyRequest::PhoneNumber(_) => ChallengeType::PhoneNumber,
            IdentifyRequest::Email(_) => ChallengeType::Email,
        },
        created_at: Utc::now().naive_utc(),
        h_challenge_code: h_code,
    };

    // set relavent session state depending on if user vault exists
    let session_data =
        db::models::session_data::SessionState::IdentifySession(challenge_data.clone());

    let session_info = NewSession {
        h_session_id: h_session_id.clone(),
        session_data,
    };

    let session = db::session::init(&state.db_pool, session_info).await?;

    Ok(session)
}
