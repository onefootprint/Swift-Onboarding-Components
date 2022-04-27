use crate::{auth::pk_tenant::PublicTenantAuthContext, errors::ApiError};
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

// TODO port onto auth
#[derive(Debug, Clone, serde::Deserialize)]
struct CreateChallengeRequest {
    kind: ChallengeKind,
}

// TODO Switch challenge APIs to use correct auth and tenant_user_id
// TODO then switch user update to have a proper auth handler
#[post("/user/{tenant_user_id}/challenge")]
async fn handler(
    state: web::Data<State>,
    pub_tenant_auth: PublicTenantAuthContext,
    path: web::Path<String>,
    request: web::Json<CreateChallengeRequest>,
) -> Result<impl Responder, ApiError> {
    let tenant_user_id = path.into_inner();
    tracing::info!("in challenge with user_id {}", tenant_user_id.clone());
    // TODO 404 if the user isn't found
    let user = db::user::get_by_tenant_user_id(&state.db_pool, tenant_user_id, pub_tenant_auth.tenant().id.clone()).await?;

    tracing::info!("in challenge with user {:?}", user.clone());

    db::challenge::expire_old(&state.db_pool, user.id.clone(), request.kind).await?;
  
    let (sh_data, e_data) = match request.kind {
        ChallengeKind::Email => (user.sh_email, user.e_email),
        ChallengeKind::PhoneNumber => (user.sh_phone_number, user.e_phone_number),
    };
    
    let sh_data = match sh_data {
        Some(sh_data) => sh_data,
        None => return Err(ApiError::DataNotSetForUser(request.kind)),
    };
    let e_data = e_data.ok_or(ApiError::UserDataNotPopulated)?;
    tracing::info!("in challenge with e_data {:?}", e_data);

    let decrypted_data = crate::enclave::lib::decrypt_bytes(&state, &e_data, user.e_private_key, enclave_proxy::DataTransform::Identity).await?;
    tracing::info!("decrypted data {:?}", decrypted_data);
    let decrypted_data = std::str::from_utf8(&decrypted_data)?;

    let (challenge, code) =
        db::challenge::create(&state.db_pool, user.id.clone(), sh_data, request.kind).await?;

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
                .destination(EmailDestination::builder().to_addresses(decrypted_data).build())
                // TODO not my email
                .from_email_address("elliott@onefootprint.com")
                .content(content)
                .send()
                .await?;
            log::info!("output from sending email message {:?}", output)
        },
        ChallengeKind::PhoneNumber => {
            let output = state.sms_client.send_text_message()
                .destination_phone_number(decrypted_data)
                .message_body(format!("Your Footprint verification code is {}. Don't share your code with anyone. We will never contact you to request this code.\n\n@onefootprint.com #{}", code, code))
                .send()
                .await?;
            log::info!("output from sending text {:?}", output)
        },
    };

    Ok(web::Json(challenge.id))
}