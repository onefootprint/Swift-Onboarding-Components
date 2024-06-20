use super::get_bool_header;
use super::get_header;
use actix_web::http::header::HeaderMap;
use actix_web::FromRequest;
use futures_util::Future;
use newtypes::SessionId;
use newtypes::Uuid;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Schema, Serialize, Deserialize)]
pub struct TelemetryHeaders {
    /// Optional client-generated and -provided session identifier that links multiple HTTP requests
    /// that occured in the same "session"
    pub session_id: Option<SessionId>,
    pub is_integration_test_req: bool,
    pub client_version: Option<String>,
}

impl TelemetryHeaders {
    const CLIENT_VERSION_HEADER_NAME: &'static str = "x-fp-client-version";
    const INTEGRATION_TESTS_HEADER_NAME: &'static str = "x-fp-integration-test";
    pub const SESSION_HEADER_NAME: &'static str = "x-fp-session-id";

    pub fn parse_from_request(headers: &HeaderMap) -> Self {
        let session_id = get_header(Self::SESSION_HEADER_NAME, headers)
            // Make sure the provided value is a Uuid to prevent accepting arbitrary user input
            .map(|h| Uuid::parse_str(&h))
            .transpose()
            .unwrap_or(None)
            .map(|uuid| uuid.to_string())
            .map(SessionId::from);
        let client_version = get_header(Self::CLIENT_VERSION_HEADER_NAME, headers);
        let is_integration_test_req =
            get_bool_header(Self::INTEGRATION_TESTS_HEADER_NAME, headers).unwrap_or_default();
        Self {
            session_id,
            is_integration_test_req,
            client_version,
        }
    }
}

impl FromRequest for TelemetryHeaders {
    type Error = crate::ModernApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers = TelemetryHeaders::parse_from_request(req.headers());
        Box::pin(async move { Ok(headers) })
    }
}
