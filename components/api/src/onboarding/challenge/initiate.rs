use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::onboarding_token::OnboardingSessionTokenContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination,
    EmailContent, Message as EmailMessage,
};
use uuid::Uuid;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
enum ChallengeKind {
    Sms,
    Email,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateChallengeRequest {
    kind: ChallengeKind,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct CreateChallengeResponse {
    id: Uuid,
}

// TODO Switch challenge APIs to use correct auth and tenant_user_id
// TODO then switch user update to have a proper auth handler
#[api_v2_operation]
pub async fn handler(
    state: web::Data<State>,
    onboarding_token_auth: OnboardingSessionTokenContext,
    request: Json<CreateChallengeRequest>,
) -> actix_web::Result<Json<ApiResponseData<CreateChallengeResponse>>, ApiError> {
    let user_vault = onboarding_token_auth.user_vault();

    let (db_kind, sh_data, e_data) = match request.kind {
        ChallengeKind::Email => (
            db::models::types::ChallengeKind::Email,
            user_vault.sh_email.clone(),
            user_vault.e_email.clone(),
        ),
        ChallengeKind::Sms => (
            db::models::types::ChallengeKind::PhoneNumber,
            user_vault.sh_phone_number.clone(),
            user_vault.e_phone_number.clone(),
        ),
    };

    db::challenge::expire_old(&state.db_pool, user_vault.id.clone(), db_kind).await?;

    let sh_data = match sh_data {
        Some(sh_data) => sh_data,
        None => return Err(ApiError::DataNotSetForUser(db_kind)),
    };
    let e_data = e_data.ok_or(ApiError::UserDataNotPopulated)?;

    let decrypted_data = crate::enclave::lib::decrypt_bytes(
        &state,
        &e_data,
        user_vault.e_private_key.clone(),
        enclave_proxy::DataTransform::Identity,
    )
    .await?;
    let decrypted_data = std::str::from_utf8(&decrypted_data)?;

    let (challenge, code) =
        db::challenge::create(&state.db_pool, user_vault.id.clone(), sh_data, db_kind).await?;

    // We may want to end up doing this asynchronously - these can be latent operations
    match request.kind {
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
                        .to_addresses(decrypted_data)
                        .build(),
                )
                // TODO not my email
                .from_email_address("elliott@onefootprint.com")
                .content(content)
                .send()
                .await?;
            log::info!("output from sending email message {:?}", output)
        }
        ChallengeKind::Sms => {
            let output = state.sms_client.send_text_message()
                .destination_phone_number(decrypted_data)
                .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code))
                .send()
                .await?;
            log::info!("output from sending text {:?}", output)
        }
    };

    Ok(Json(ApiResponseData {
        data: CreateChallengeResponse { id: challenge.id },
    }))
}
