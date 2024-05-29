use newtypes::vendor_credentials::MiddeskCredentials;
use newtypes::{
    BusinessDataForRequest,
    PiiJsonValue,
    TenantId,
};
use reqwest::StatusCode;
use thiserror::Error;

pub mod client;
pub mod request;
pub mod response;

use self::response::business::BusinessResponse;
use self::response::MiddeskApiErrorResponse;

pub struct MiddeskCreateBusinessRequest {
    pub business_data: BusinessDataForRequest,
    pub credentials: MiddeskCredentials,
    pub tenant_id: TenantId,
}
#[derive(Clone)]
pub struct MiddeskCreateBusinessResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: BusinessResponse,
}

pub struct MiddeskGetBusinessRequest {
    pub business_id: String,
    pub credentials: MiddeskCredentials,
}

#[derive(Clone)]
pub struct MiddeskGetBusinessResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: BusinessResponse,
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    ReqwestError(#[from] MiddeskReqwestError),
    #[error("error response from middesk api: {0}")]
    MiddeskErrorResponse(#[from] MiddeskApiErrorResponse),
    #[error("unexpected error from middesk api: {0} {1}")]
    MiddeskUnknownError(StatusCode, String),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("url error: {0}")]
    RequestUrlError(#[from] url::ParseError),
    #[error("expected field missing: {0}")]
    ExpectedFieldMissing(String),
    #[error("VerificationResult not found for business_id: {0}")]
    CreateBusinessResultNotFound(String),
    #[error("Malformed webhook response")]
    MalformedWebhookResponse,
    #[error("Unexpected webhook type: {0}")]
    UnexpectedWebhookType(String),
    #[error("expected 1 outstanding webhook vreq but {0} found")]
    UnexpectedNumberOfOutstandingWebhookVreqs(usize),
}

#[derive(Debug, thiserror::Error)]
pub enum MiddeskReqwestError {
    #[error("request error : {0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
}
