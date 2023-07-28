use super::error::{Error, StytchError};
use serde::*;

pub fn parse_response(value: serde_json::Value) -> Result<LookupResponse, Error> {
    let response: Response = serde_json::value::from_value(value)?;
    match response {
        Response::Success(r) => Ok(r),
        Response::Error(r) => Err(Error::StytchError(r)),
    }
}

#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum Response {
    Success(LookupResponse),
    Error(StytchErrorResponse),
}

#[derive(Debug, Clone, Deserialize)]
pub struct StytchErrorResponse {
    pub error_message: StytchError,
    pub status_code: Option<u16>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LookupResponse {
    pub telemetry_id: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn parse_success() {
        let json = json!({
            "telemetry_id": "abc_123",
        });
        let parsed = parse_response(json).unwrap();
        assert_eq!("abc_123".to_owned(), parsed.telemetry_id);
    }

    #[test]
    fn parse_error() {
        let json = json!({
            "error_message": "The telemety_id was not found.",
        });
        let parsed = parse_response(json).unwrap_err();

        let Error::StytchError(e) = parsed else {
            panic!("Expected StytchError, got {:?}", parsed);
        };
        assert_eq!(StytchError::TelemetryIdNotFound, e.error_message);
    }

    #[test]
    fn parse_unknown_error() {
        let json = json!({
            "error_message": "Oh shoot",
        });
        let parsed = parse_response(json).unwrap_err();

        let Error::StytchError(e) = parsed else {
            panic!("Expected StytchError, got {:?}", parsed);
        };

        let StytchError::Unknown(s) = e.error_message else {
            panic!("Expected StytchError::Unknown");
        };
        assert_eq!("Oh shoot".to_owned(), s);
    }
}
