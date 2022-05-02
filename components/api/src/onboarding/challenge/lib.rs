use crate::errors::ApiError;
use crate::State;
use paperclip::actix::{web, web::Json, Apiv2Schema};

use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination,
    EmailContent, Message as EmailMessage,
};
use db::models::types::ChallengeKind;
use db::models::user_vaults::UserVault;
use uuid::Uuid;

// TODO use strum
#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateChallengeRequest {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    email: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    phone_number: Option<String>,
}

pub async fn validate(
    state: &web::Data<State>,
    request: Json<CreateChallengeRequest>,
) -> Result<(ChallengeKind, String), ApiError> {
    if request.phone_number.is_some() && request.email.is_some() {
        return Err(ApiError::CannotSpecifyBothEmailAndPhone);
    }
    let (kind, raw_data) = if let Some(raw_phone_number) = request.phone_number.clone() {
        (ChallengeKind::PhoneNumber, raw_phone_number)
    } else if let Some(raw_email) = request.email.clone() {
        (ChallengeKind::Email, raw_email)
    } else {
        return Err(ApiError::MustSpecifyEmailOrPhone);
    };

    let validated_data = match kind {
        ChallengeKind::PhoneNumber => {
            crate::onboarding::clean_phone_number(&state, &raw_data).await?
        }
        ChallengeKind::Email => crate::onboarding::clean_email(raw_data),
    };
    Ok((kind, validated_data))
}

pub async fn initiate(
    state: &web::Data<State>,
    user_vault: &UserVault,
    validated_data: String,
    sh_data: Vec<u8>,
    kind: ChallengeKind,
) -> Result<Uuid, ApiError> {
    // TODO only want to expire old challenges for this tenant - user should be allowed to have two challenges for different tenants
    db::challenge::expire_old(&state.db_pool, user_vault.id.clone(), kind).await?;

    let (challenge, code) =
        db::challenge::create(&state.db_pool, user_vault.id.clone(), sh_data, kind).await?;

    // We may want to end up doing this asynchronously - these can be latent operations
    match kind {
        ChallengeKind::Email => {
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
            let content = EmailContent::builder().simple(message).build();
            let output = state
                .email_client
                .send_email()
                .destination(
                    EmailDestination::builder()
                        .to_addresses(validated_data)
                        .build(),
                )
                // TODO not my email
                .from_email_address("elliott@onefootprint.com")
                .content(content)
                .send()
                .await?;
            log::info!("output from sending email message {:?}", output)
        }
        ChallengeKind::PhoneNumber => {
            let output = state.sms_client.send_text_message()
                .destination_phone_number(validated_data)
                .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code))
                .send()
                .await?;
            log::info!("output from sending text {:?}", output)
        }
    };
    Ok(challenge.id)
}
