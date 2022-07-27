use crate::auth::session_data::email_verify::EmailVerifySession;
use crate::auth::session_data::AuthSessionData;
use crate::errors::ApiError;
use crate::State;
use crypto::random::gen_random_alphanumeric_code;
use newtypes::{PiiString, UserDataId};
use paperclip::actix::web;
use reqwest::StatusCode;
use std::collections::HashMap;

use super::session::AuthSession;

#[derive(Debug, Clone)]
pub struct SendgridClient {
    pub from_email: String,
    pub challenge_template_id: String,
    pub magic_link_template_id: String,
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
    pub fn new(
        api_key: String,
        from_email: String,
        challenge_template_id: String,
        magic_link_template_id: String,
    ) -> Self {
        let client = reqwest::Client::new();
        Self {
            api_key,
            from_email,
            challenge_template_id,
            magic_link_template_id,
            client,
        }
    }

    pub async fn send_with_magic_link_template(
        &self,
        to_email: String,
        curl_url: String,
    ) -> Result<(), ApiError> {
        self.send_with_link_template(to_email, curl_url, &self.magic_link_template_id)
            .await
    }

    pub async fn send_with_challenge_template(
        &self,
        to_email: String,
        curl_url: String,
    ) -> Result<(), ApiError> {
        self.send_with_link_template(to_email, curl_url, &self.challenge_template_id)
            .await
    }

    pub async fn send_with_link_template(
        &self,
        to_email: String,
        curl_url: String,
        template_id: &str,
    ) -> Result<(), ApiError> {
        let req = SendgridTemplateRequest {
            personalizations: vec![SendgridPersonalization {
                to: vec![SendgridEmail { email: to_email }],
                dynamic_template_data: HashMap::from([("curl_request".to_string(), curl_url)]),
            }],
            from: SendgridEmail {
                email: self.from_email.clone(),
            },
            template_id: template_id.to_string(),
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

pub(crate) async fn send_magic_link_dashboard_auth_email(
    state: &State,
    email_address: String,
    url: String,
) -> Result<(), ApiError> {
    state
        .sendgrid_client
        .send_with_magic_link_template(email_address, url)
        .await?;
    Ok(())
}

pub(crate) async fn send_email_challenge(
    state: &web::Data<State>,
    user_data_id: UserDataId,
    email_address: &PiiString,
) -> Result<(), ApiError> {
    let session_data = AuthSessionData::EmailVerify(EmailVerifySession { user_data_id });

    // create new session
    let token = AuthSession::create(state, session_data, chrono::Duration::days(1)).await?;

    // add unique url query param to avoid incorrect caching by browser/client
    let unique_param = gen_random_alphanumeric_code(5);
    let confirm_link_str = format!("https://confirm.onefootprint.com/?v={}#{}", unique_param, token);
    state
        .sendgrid_client
        .send_with_challenge_template(email_address.leak_to_string(), confirm_link_str)
        .await?;
    Ok(())
}
