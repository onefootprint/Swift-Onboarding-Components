use crate::errors::ApiError;
use crate::State;
use chrono::Utc;
use db::models::session_data::{ChallengeData, ChallengeType};
use paperclip::actix::{web, Apiv2Schema};

use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination,
    EmailContent, Message as EmailMessage,
};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CreateChallengeRequest {
    Email(String),
    PhoneNumber(String),
}

pub async fn initiate(
    state: &web::Data<State>,
    challenge_type: ChallengeType,
) -> Result<ChallengeData, ApiError> {
    let code: String = crypto::random::gen_rand_n_digit_code(6);
    let _ = match &challenge_type {
        ChallengeType::Email(data) => {
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
        ChallengeType::PhoneNumber(data) => {
            let output = state.sms_client.send_text_message()
                .destination_phone_number(data)
                .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code.clone(), code.clone()))
                .send()
                .await?;
            log::info!("output from sending phone {:?}", output);
            Ok(())
        }
        // TODO we shouldn't get here - this is more an HTTP 500
        ChallengeType::NotSet => Err(ApiError::ChallengeDataNotSet),
    };

    let h_code = crypto::sha256(code.as_bytes()).to_vec();
    let challenge_data = ChallengeData {
        challenge_type,
        created_at: Utc::now().naive_utc(),
        h_challenge_code: h_code,
    };

    Ok(challenge_data)
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
