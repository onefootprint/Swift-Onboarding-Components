use crate::auth::session_data::email::email_verify::EmailVerifySession;
use crate::auth::session_data::{ServerSession, SessionData};
use crate::errors::ApiError;
use crate::State;
use crypto::random::gen_random_alphanumeric_code;
use newtypes::{DataKind, Fingerprinter, UserVaultId};
use paperclip::actix::web;
use reqwest::StatusCode;
use std::collections::HashMap;

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

pub fn clean_email(raw_email: String) -> String {
    raw_email.to_lowercase()
}

pub(crate) async fn send_email_challenge(
    state: &web::Data<State>,
    uv_id: UserVaultId,
    email_address: String,
) -> Result<(), ApiError> {
    let session_data = SessionData::EmailVerify(EmailVerifySession {
        uv_id,
        sh_email: state.compute_fingerprint(DataKind::Email, &email_address).await?,
    });

    // create new session
    let token = ServerSession::create(state, session_data, chrono::Duration::days(1)).await?;

    // add unique url query param to avoid incorrect caching by browser/client
    let unique_param = gen_random_alphanumeric_code(5);
    let curl_request_str = format!("https://verify.ui.footprint.dev/?v={}#{}", unique_param, token);
    state
        .sendgrid_client
        .send_with_challenge_template(email_address, curl_request_str)
        .await?;
    Ok(())
}
