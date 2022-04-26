use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};

use aws_sdk_pinpointemail::{
    model::{
        Body as EmailBody,
        Content as EmailStringContent,
        Destination as EmailDestination,
        Message as EmailMessage,
        EmailContent,
    },
};
use db::models::types::ChallengeKind;

#[derive(Debug, Clone, serde::Deserialize)]
struct CreateChallengeRequest {
    kind: ChallengeKind,
    tenant_pub_key: String,
}

#[post("/user/{user_id}/challenge")]
async fn handler(
    state: web::Data<State>,
    path: web::Path<String>,
    request: web::Json<CreateChallengeRequest>,
) -> Result<impl Responder, ApiError> {
    db::tenant::pub_auth_check(&state.db_pool, request.tenant_pub_key.clone()).await?;
    
    let user_id = path.into_inner();
    tracing::info!("in challenge with user_id {}", user_id.clone());
    // TODO 404 if the user isn't found
    let user = db::user::get(&state.db_pool, user_id.clone()).await?;

    db::challenge::expire_old(&state.db_pool, user_id.clone(), request.kind).await?;
  
    let sh_data = match request.kind {
        ChallengeKind::Email => user.sh_email,
        ChallengeKind::PhoneNumber => user.sh_phone_number,
    };
    
    let sh_data = match sh_data {
        Some(sh_data) => sh_data,
        None => return Err(ApiError::DataNotSetForUser(request.kind)),
    };

    let (challenge, code) =
        db::challenge::create(&state.db_pool, user_id.clone(), sh_data, request.kind).await?;

    // We may want to end up doing this asynchronously - these can be latent operations
    match request.kind {
        ChallengeKind::Email => {
            let body_text = EmailStringContent::builder().data(format!("Hello from footprint!\n\nYour Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code)).build();
            let body_html = EmailStringContent::builder().data(format!("<h1>Hello from footprint!</h1><br><br>Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.<br><br>@onefootprint.com #{}", code, code)).build();
            let body = EmailBody::builder()
                .text(body_text)
                .html(body_html)
                .build();
            let message = EmailMessage::builder()
                .subject(EmailStringContent::builder().data("Hello from Footprint!").build())
                .body(body)
                .build();
            let content = EmailContent::builder()
                .simple(message)
                .build();
            let output = state.email_client.send_email()
                // TODO decrypt email
                .destination(EmailDestination::builder().to_addresses("TODO").build())
                // TODO not my email
                .from_email_address("elliott@onefootprint.com")
                .content(content)
                .send()
                .await?;
            println!("output from sending email message {:?}", output)
        },
        ChallengeKind::PhoneNumber => {
            let output = state.sms_client.send_text_message()
                // TODO decrypt phone number
                .destination_phone_number("TODO")
                .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code))
                .send()
                .await?;
            println!("output from sending text {:?}", output)
        },
    };

    Ok(web::Json(challenge.id))
}