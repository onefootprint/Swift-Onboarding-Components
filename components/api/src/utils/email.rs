use aws_sdk_pinpointemail::model::{
    Body as EmailBody, Content as EmailStringContent, Destination as EmailDestination, EmailContent,
    Message as EmailMessage,
};
use chrono::NaiveDateTime;
use crypto::b64::Base64Data;
use crypto::serde_cbor;
use paperclip::actix::web;
use std::str::FromStr;

use crate::errors::ApiError;
use crate::utils::crypto::{seal_to_vault_pkey, signed_hash};
use crate::State;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifyChallenge {
    pub expires_at: NaiveDateTime,
    pub email: String,
}

pub fn clean_email(raw_email: String) -> String {
    raw_email.to_lowercase()
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct EmailVerifyData {
    pub sh_email: Vec<u8>,
    pub e_email_challenge: Vec<u8>,
}

impl EmailVerifyData {
    pub fn serialize(&self) -> Result<String, ApiError> {
        let email_verify_data = serde_cbor::to_vec(self).map_err(crypto::Error::from)?;
        Ok(Base64Data(email_verify_data).to_string())
    }

    pub fn deserialize(data: String) -> Result<EmailVerifyData, ApiError> {
        let data_slice = Base64Data::from_str(&data).map_err(crypto::Error::from)?.0;
        let email_verify_data: EmailVerifyData =
            serde_cbor::from_slice(&data_slice).map_err(crypto::Error::from)?;
        Ok(email_verify_data)
    }
}

pub(crate) async fn send_email_challenge(
    state: &web::Data<State>,
    public_key: Vec<u8>,
    email_address: String,
) -> Result<(), ApiError> {
    let email_challenge = EmailVerifyChallenge {
        expires_at: chrono::Utc::now().naive_utc() + chrono::Duration::days(1),
        email: email_address.clone(),
    };
    let email_challenge = serde_json::to_string::<EmailVerifyChallenge>(&email_challenge)
        .map_err(|_| ApiError::ChallengeNotValid)?;
    let email_verify_data = EmailVerifyData {
        sh_email: signed_hash(state, email_address.clone()).await?,
        e_email_challenge: seal_to_vault_pkey(email_challenge, &public_key)?,
    }
    .serialize()?;

    let curl_request_str = format!("https://verify.ui.footprint.dev/#{}", email_verify_data,);
    let content = build_email_challenge_content_body(curl_request_str);
    let _output = state
        .email_client
        .send_email()
        .destination(EmailDestination::builder().to_addresses(email_address).build())
        .from_email_address("noreply@infra.footprint.dev")
        .content(content)
        .send()
        .await?;
    Ok(())
}

fn build_email_challenge_content_body(contents: String) -> EmailContent {
    let body_text = EmailStringContent::builder()
        .data(format!(
            "Hello from footprint!\nYou can issue this curl request to mark your email as verified:\n\n{}",
            contents
        ))
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
