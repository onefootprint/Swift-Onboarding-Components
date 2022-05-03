use crate::errors::ApiError;
use crate::State;
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

pub async fn challenge(
    state: &web::Data<State>,
    data: ChallengeData,
    code: String,
) -> Result<(), ApiError> {
    let _ = match data.challenge_type {
        ChallengeType::Email(data) => {
            let content = build_email_content_body(code);
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
                .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code))
                .send()
                .await?;
            log::info!("output from sending phone {:?}", output);
            Ok(())
        }
        ChallengeType::NotSet => Err(ApiError::ChallengeDataNotSet),
    };

    Ok(())
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
