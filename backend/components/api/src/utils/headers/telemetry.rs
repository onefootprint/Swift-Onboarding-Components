use actix_web::http::header::HeaderMap;
use newtypes::Uuid;

use super::get_header;

pub struct TelemetryHeaders {
    /// Optional client-generated and -provided session identifier that links multiple HTTP requests
    /// that occured in the same "session"
    pub session_id: Option<String>,
}

impl TelemetryHeaders {
    pub fn parse_from_request(headers: &HeaderMap) -> Self {
        let session_id = get_header("x-fp-session-id", headers)
            // Make sure the provided value is a Uuid to prevent accepting arbitrary user input
            .map(|h| Uuid::parse_str(&h))
            .transpose()
            .unwrap_or(None)
            .map(|uuid| uuid.to_string());
        Self { session_id }
    }
}
