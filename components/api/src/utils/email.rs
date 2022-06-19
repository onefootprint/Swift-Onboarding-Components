use crate::errors::ApiError;
use crate::utils::crypto::{seal_to_vault_pkey, signed_hash};
use crate::State;
use chrono::NaiveDateTime;
use crypto::b64::Base64Data;
use crypto::serde_cbor;
use paperclip::actix::web;
use reqwest::StatusCode;
use std::collections::HashMap;
use std::str::FromStr;

#[derive(Debug, Clone)]
pub struct SendgridClient {
    pub from_email: String,
    // id of email template for challenges
    pub challenge_template_id: String,
    api_key: String,
    client: reqwest::Client,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridRequest {
    personalizations: Vec<SendgridPersonalization>,
    from: SendgridEmail,
    subject: String,
    content: Vec<SendgridContent>,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridTemplateRequest {
    personalizations: Vec<SendgridPersonalization>,
    from: SendgridEmail,
    template_id: String,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridPersonalization {
    to: Vec<SendgridEmail>,
    dynamic_template_data: HashMap<String, String>,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridEmail {
    email: String,
}

#[derive(Debug, Clone, serde::Serialize)]
struct SendgridContent {
    #[serde(rename(serialize = "type"))]
    type_: String,
    value: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct SendgridErrors {
    errors: Vec<SendgridErrorFieldAndMessage>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct SendgridErrorFieldAndMessage {
    field: Option<String>,
    message: String,
}

impl SendgridClient {
    pub fn new(api_key: String, from_email: String, challenge_template_id: String) -> Self {
        let client = reqwest::Client::new();
        Self {
            api_key,
            from_email,
            challenge_template_id,
            client,
        }
    }

    pub async fn send_with_challenge_template(
        &self,
        to_email: String,
        curl_url: String,
    ) -> Result<(), ApiError> {
        let req = SendgridTemplateRequest {
            personalizations: vec![SendgridPersonalization {
                to: vec![SendgridEmail { email: to_email }],
                dynamic_template_data: HashMap::from([("curl_request".to_string(), curl_url)]),
            }],
            from: SendgridEmail {
                email: self.from_email.clone(),
            },
            template_id: self.challenge_template_id.to_string(),
        };
        let res = self
            .client
            .post("https://api.sendgrid.com/v3/mail/send")
            .bearer_auth(self.api_key.clone())
            .header("content-type", "application/json")
            .json(&req)
            .send()
            .await?;

        if res.status().eq(&StatusCode::ACCEPTED) {
            return Ok(());
        }

        let err = &res.text().await?;
        Err(ApiError::SendgridError(err.to_owned()))
    }
}

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
    let _output = state
        .sendgrid_client
        .send_with_challenge_template(email_address, curl_request_str)
        .await?;
    Ok(())
}
