use newtypes::{IdentifyRequest, PiiString};
use std::fmt::{Debug, Display};

use crate::IdologyReqwestError;

use super::conversion::IdologyRequest;

#[derive(Clone)]
pub struct IdologyClient {
    client: reqwest::Client,
    url: String,
    username: String,
    password: String,
}

impl std::fmt::Debug for IdologyClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("idology")
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(rename_all = "kebab-case")]
pub struct IdologyResponse {
    response: IdologyResponseInner,
}

#[derive(serde::Serialize, serde::Deserialize, Debug)]
#[serde(untagged)]
enum IdologyResponseInner {
    Error(IdologyApiError),
    Success(IdologySuccess),
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub struct IdologyApiError {
    error: Option<String>,
    /// this will be "failed" if the service is unreachable/down
    failed: Option<String>,
}

impl Display for IdologyApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "error_message: {:?}, failed_message : {:?}",
            self.error, self.failed
        )
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub struct IdologySuccess {
    id_number: String,
    summary_result: IdologyKeyAndMessage,
    results: IdologyKeyAndMessage,
    qualifiers: Qualifier,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
struct Qualifier {
    qualifier: IdologyKeyAndMessage,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
struct IdologyKeyAndMessage {
    key: String,
    message: String,
}

impl IdologyClient {
    // TODO: figure out sandbox URL
    pub fn new(
        username: String,
        password: String,
        _sandbox: bool,
    ) -> Result<Self, crate::IdologyReqwestError> {
        let url = "https://web.idologylive.com/api/idiq.svc";
        let client = reqwest::Client::builder().build()?;
        Ok(Self {
            client,
            url: url.to_string(),
            username,
            password,
        })
    }

    /// ExpectId module
    pub async fn verify_expectid(
        &self,
        identify_request: IdentifyRequest,
    ) -> Result<IdologySuccess, crate::IdologyError> {
        let req_list = IdologyRequest::new(
            PiiString::from(&self.username),
            PiiString::from(&self.password),
            identify_request,
        )?;
        let response = self
            .client
            .get(&self.url)
            .query(&req_list)
            .send()
            .await
            .map_err(|err| crate::IdologyReqwestError::ReqwestSendError(err.to_string()))?;

        let idology_response: IdologyResponse = response
            .json::<IdologyResponse>()
            .await
            .map_err(IdologyReqwestError::InternalError)?;

        let idology_response = idology_response.response;
        match idology_response {
            IdologyResponseInner::Error(error) => Err(crate::IdologyError::IdologyErrorResponse(error)),
            IdologyResponseInner::Success(success) => Ok(success),
        }
    }
}
