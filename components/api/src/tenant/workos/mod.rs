use std::collections::HashMap;

use crate::errors::ApiError;
use paperclip::actix::web;
use paperclip::actix::Apiv2Schema;

pub mod callback;
pub mod magic_auth;
pub mod oauth;

pub fn routes() -> web::Scope {
    web::scope("/auth")
        .service(callback::handler)
        .service(magic_auth::handler)
        .service(oauth::handler)
}

#[derive(Debug, Clone)]
pub struct WorkOSClient {
    pub client_id: String,
    pub default_org: String,
    client: reqwest::Client,
    client_secret: String,
}

impl WorkOSClient {
    pub fn new(client_id: String, default_org: String, client_secret: String) -> Self {
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .unwrap();
        Self {
            client_id,
            default_org,
            client_secret,
            client,
        }
    }
    pub async fn get_profile(&self, code: String) -> Result<WorkOSProfile, ApiError> {
        let (client_id, client_secret) = (self.client_id.clone(), self.client_secret.clone());
        let url = format!("https://api.workos.com/sso/token?client_id={client_id}&client_secret={client_secret}&grant_type=authorization_code&code={code}");

        let response = self
            .client
            .post(url)
            .send()
            .await
            .map_err(|x| ApiError::WorkOsError(x.to_string()))?;

        // let str = std::str::from_utf8(response.body().await?.as_ref())?.to_string();
        // log::error!("{:?}", str);

        let profile_and_token = response.json::<WorkOSProfileAndToken>().await?;

        Ok(profile_and_token.profile)
    }

    pub async fn post_session(&self, email: String) -> Result<String, ApiError> {
        let session_url = "https://api.workos.com/passwordless/sessions";
        let request = serde_json::json!({
            "email": email,
            "type": "MagicLink",
        });
        let session_response = self
            .client
            .post(session_url)
            .bearer_auth(self.client_secret.clone())
            .header("content-type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|x| ApiError::WorkOsError(x.to_string()))?;
        let session = session_response.json::<WorkOSPasswordlessSession>().await?;
        Ok(session.id)
    }

    pub async fn post_send_link(&self, id: String) -> Result<LinkAuthResponse, ApiError> {
        // Send link to user email
        let link_url = format!("https://api.workos.com/passwordless/sessions/{id}/send");
        let send_link_response = self
            .client
            .post(link_url)
            .bearer_auth(self.client_secret.clone())
            .send()
            .await
            .map_err(|x| ApiError::WorkOsError(x.to_string()))?;

        let auth_response = send_link_response.json::<LinkAuthResponse>().await?;

        Ok(auth_response)
    }

    pub async fn get_authorization_url(
        &self,
        provider: String,
        redirect_url: String,
    ) -> Result<String, ApiError> {
        let client_id = self.client_id.clone();
        let auth_url = format!("https://api.workos.com/sso/authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_url}&provider={provider}");
        let auth_response = self
            .client
            .get(auth_url)
            .send()
            .await
            .map_err(|x| ApiError::WorkOsError(x.to_string()))?;

        let mut header = auth_response.headers().to_owned();

        let location = header.get_mut(actix_web::http::header::LOCATION);

        match location {
            Some(header) => Ok(header.to_str()?.to_string()),
            None => Err(ApiError::WorkOSError),
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct WorkOSProfileAndToken {
    access_token: String,
    profile: WorkOSProfile,
}
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct WorkOSProfile {
    // TODO: Potentially wrap these in custom string types
    id: String,
    connection_id: String,
    organization_id: Option<String>,
    connection_type: String,
    email: String,
    first_name: Option<String>,
    idp_id: String,
    last_name: Option<String>,
    object: String,
    raw_attributes: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct WorkOSPasswordlessSession {
    id: String,
    email: String,
    // TODO: what datetime format is this?
    expires_at: String,
    link: String,
    object: String,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(untagged)]
pub enum LinkAuthResponse {
    Failure { message: String, errors: Vec<ErrorItem> },
    Success { success: bool },
    Message { message: String },
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ErrorItem {
    field: String,
    code: String,
}
