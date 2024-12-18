use self::response::LookupResponse;
use error::Error as StytchError;
use newtypes::PiiJsonValue;
use reqwest::StatusCode;

pub mod client;
pub mod error;
pub mod response;

pub struct StytchLookupRequest {
    pub telemetry_id: String,
}

#[derive(derive_more::Deref)]
pub struct StytchLookupResponse {
    #[deref]
    pub result: Result<LookupResponse, StytchError>,
    pub raw_response: PiiJsonValue,
}

impl StytchLookupResponse {
    pub async fn from_response(response: reqwest::Response) -> Self {
        let http_status = response.status();
        let raw_json: Result<serde_json::Value, StytchError> = response
            .json()
            .await
            .map_err(|e| StytchError::ReqwestErrorWithCode(e, http_status.as_u16()));
        match raw_json {
            Ok(j) => Self::from_value(j, http_status),
            Err(e) => Self {
                result: Err(e),
                raw_response: serde_json::json!({}).into(),
            },
        }
    }

    fn from_value(value: serde_json::Value, status_code: StatusCode) -> Self {
        let result = if status_code.is_success() {
            response::parse_response(value.clone())
        } else {
            Err(StytchError::HttpError(status_code.as_u16()))
        };
        Self {
            result,
            raw_response: value.into(),
        }
    }
}
