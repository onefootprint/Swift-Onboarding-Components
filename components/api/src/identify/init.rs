use crate::auth::identify_session::{IdentifySessionContext, IdentifySessionState};
use crate::identify::{clean_email, clean_phone_number};
use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::client_public_key::PublicTenantAuthContext, errors::ApiError};
use actix_session::Session;
use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination,
    EmailContent, Message as EmailMessage,
};
use chrono::Utc;
use crypto::hex::ToHex;
use crypto::random::gen_random_alphanumeric_code;
use db::models::{
    session_data::{ChallengeData, ChallengeType},
    sessions::NewSession,
};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IdentifyRequest {
    Email(String),
    PhoneNumber(String),
}

#[api_v2_operation]
pub async fn handler(
    request: Json<IdentifyRequest>,
    session: Session,
    pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    // clean data
    let cleaned_data = match request.0.clone() {
        IdentifyRequest::Email(s) => clean_email(s),
        IdentifyRequest::PhoneNumber(p) => clean_phone_number(&state, &p).await?,
    };

    // create a token to identify session for future lookup
    let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
    let h_session_id: String = crypto::sha256(token.as_bytes()).encode_hex();

    // initiate a challenge to given identifier & set session data in db
    let challenge_data = initiate(
        &state,
        cleaned_data.clone(),
        request.0.clone(),
        h_session_id.clone(),
        pub_tenant_auth.tenant().clone().id,
    )
    .await?;

    IdentifySessionState {
        session_id: token,
        user_identifier: cleaned_data.clone(),
    }
    .set(&session)?;

    Ok(Json(ApiResponseData {
        data: "challenge initiated".to_string(),
    }))
}

pub async fn initiate(
    state: &web::Data<State>,
    data: String,
    challenge_type: IdentifyRequest,
    h_session_id: String,
    tenant_id: String,
) -> Result<ChallengeData, ApiError> {
    // TODO: generate random 6 digit code
    let code: String = "123456".to_owned(); // crypto::random::gen_rand_n_digit_code(6);

    // send challenge
    let _ = send_challenge(state, data, challenge_type.clone(), code.clone()).await?;

    // initiate session info
    let challenge_data =
        init_session_for_challenge(state, code, challenge_type.clone(), h_session_id, tenant_id)
            .await?;

    Ok(challenge_data)
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
) -> Result<ChallengeData, ApiError> {
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

    let _ = db::session::init(&state.db_pool, session_info).await?;

    Ok(challenge_data)
}
