use crate::auth::session::AuthSessionData;
use crate::auth::user::EmailVerifySession;
use crate::errors::ApiError;
use crate::State;
use crypto::random::gen_random_alphanumeric_code;
use newtypes::{ContactInfoId, PiiString};
use paperclip::actix::web;
use reqwest::StatusCode;
use std::collections::HashMap;

use super::session::AuthSession;

#[derive(Debug, Clone)]
pub struct SendgridClient {
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
    const DASHBOARD_INVITE_TEMPLATE_ID: &str = "d-74de0508a7834a2494c499d2a70c41ba";
    const EMAIL_VERIFY_TEMPLATE_ID: &str = "d-c558e640dad04726a31e6710c7ffc57c";
    const MAGIC_LINK_TEMPLATE_ID: &str = "d-a631e0eb72984e28a39940aa8f3bbe60";
    const FROM_EMAIL: &str = "noreply@noreply.onefootprint.com";

    pub fn new(api_key: String) -> Self {
        let client = reqwest::Client::new();
        Self { api_key, client }
    }

    pub async fn send_magic_link_email(&self, to_email: String, curl_url: String) -> Result<(), ApiError> {
        let template_data = HashMap::from([("curl_request".to_string(), curl_url)]);
        self.send_template(to_email, Self::MAGIC_LINK_TEMPLATE_ID, template_data)
            .await
    }

    pub async fn send_dashboard_invite_email(
        &self,
        to_email: String,
        inviter: String,
        org_name: String,
        accept_url: String,
    ) -> Result<(), ApiError> {
        let template_data = HashMap::from([
            ("recipient_email".to_string(), to_email.clone()),
            ("inviter".to_string(), inviter),
            ("org_name".to_string(), org_name),
            ("accept_url".to_string(), accept_url),
        ]);
        self.send_template(to_email, Self::DASHBOARD_INVITE_TEMPLATE_ID, template_data)
            .await
    }

    pub async fn send_email_verify_email(&self, to_email: String, curl_url: String) -> Result<(), ApiError> {
        let template_data = HashMap::from([("curl_request".to_string(), curl_url)]);
        self.send_template(to_email, Self::EMAIL_VERIFY_TEMPLATE_ID, template_data)
            .await
    }

    #[tracing::instrument(skip_all)]
    async fn send_template(
        &self,
        to_email: String,
        template_id: &str,
        template_data: HashMap<String, String>,
    ) -> Result<(), ApiError> {
        let req = SendgridTemplateRequest {
            personalizations: vec![SendgridPersonalization {
                to: vec![SendgridEmail { email: to_email }],
                dynamic_template_data: template_data,
            }],
            from: SendgridEmail {
                email: Self::FROM_EMAIL.to_owned(),
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

pub async fn send_email_challenge(
    state: &web::Data<State>,
    email_id: ContactInfoId,
    email_address: &PiiString,
) -> Result<(), ApiError> {
    let session_data = AuthSessionData::EmailVerify(EmailVerifySession { email_id });

    // create new session
    let token = AuthSession::create(state, session_data, chrono::Duration::days(30)).await?;

    // add unique url query param to avoid incorrect caching by browser/client
    let unique_param = gen_random_alphanumeric_code(5);
    let base_url = if state.config.service_config.is_production() {
        "https://confirm.onefootprint.com"
    } else if state.config.service_config.is_local() {
        "http://localhost:3006"
    } else {
        "https://confirm.preview.onefootprint.com"
    };
    let confirm_link_str = format!("{}/?v={}#{}", base_url, unique_param, token);
    state
        .sendgrid_client
        .send_email_verify_email(email_address.leak_to_string(), confirm_link_str)
        .await?;
    Ok(())
}
