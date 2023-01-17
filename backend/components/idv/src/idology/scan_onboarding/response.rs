use crate::idology::{
    error as IdologyError,
    response_common::{IDologyQualifiers, IdologyResponseHelpers, KeyResponse},
    IdologyError::RequestError,
};
use newtypes::idology::{
    IdologyImageCaptureErrors, IdologyScanOnboardingCaptureDecision, IdologyScanOnboardingCaptureResult,
};

pub fn parse_response(value: serde_json::Value) -> Result<ScanOnboardingAPIResponse, IdologyError::Error> {
    let response: ScanOnboardingAPIResponse = serde_json::value::from_value(value)?;
    Ok(response)
}
#[derive(Debug, Clone, serde::Deserialize)]
pub struct ScanOnboardingAPIResponse {
    pub response: ScanOnboardingResponse,
}
#[derive(Debug, Clone, serde::Deserialize, Default)]
#[serde(rename_all = "kebab-case")]
pub struct ScanOnboardingResponse {
    pub query_id: Option<i64>,
    /// The ExpectID Scan Onboard result.
    /// This value indicates if the ID is valid and able to be processed, and can be one of three possible results:
    ///   capture.completed
    ///   capture.image.error
    ///   capture.internal.error
    pub capture_result: Option<KeyResponse>,
    /// The ExpectID Scan Onboard Decision result. This should only be used if ExpectID Scan Onboard Decision Builder is enabled.
    /// This value indicates if the ID is approved based on the Scan Onboard Decision Builder settings and can be one of two possible results:
    ///   result.scan.capture.id.approved
    ///   result.scan.capture.id.not.approved
    pub capture_decision: Option<KeyResponse>,
    pub qualifiers: Option<IDologyQualifiers>,
    // TODO: put this back in once we have a story around PII in raw vendor responses
    // pub capture_data: Option<CaptureData>,
    pub error: Option<serde_json::Value>,
}

impl ScanOnboardingResponse {
    pub fn capture_result(&self) -> Result<IdologyScanOnboardingCaptureResult, IdologyError::Error> {
        let Some(ref result) =  self.capture_result else {
            return Err(IdologyError::Error::NoStatusFound)
        };

        IdologyScanOnboardingCaptureResult::try_from(result.key.as_str())
            .map_err(|e| IdologyError::Error::UnknownResponseStatus(e.to_string()))
    }

    pub fn capture_result_is_internal_error(&self) -> bool {
        self.capture_result()
            .map(|r| matches!(r, IdologyScanOnboardingCaptureResult::InternalError))
            .unwrap_or_default()
    }

    pub fn capture_decision(&self) -> Result<IdologyScanOnboardingCaptureDecision, IdologyError::Error> {
        let Some(ref result) =  self.capture_decision else {
            return Err(IdologyError::Error::NoStatusFound)
        };

        IdologyScanOnboardingCaptureDecision::try_from(result.key.as_str())
            .map_err(|e| IdologyError::Error::UnknownResponseStatus(e.to_string()))
    }

    fn image_error(e: Vec<String>) -> Vec<IdologyImageCaptureErrors> {
        e.into_iter()
            .map(|err| {
                IdologyImageCaptureErrors::try_from(err.as_str())
                    .unwrap_or(IdologyImageCaptureErrors::ImageError)
            })
            .collect()
    }

    // Construct api request related errors and image upload related errors
    pub fn error(&self) -> Option<(Option<RequestError>, Vec<IdologyImageCaptureErrors>)> {
        let Some(err) = self.error.clone() else {
            return None
        };

        match err {
            serde_json::Value::String(_) => {
                let err_str: String = serde_json::value::from_value(err).ok()?;
                let api_error = IdologyResponseHelpers::parse_idology_error(err_str);

                Some((Some(api_error), vec![]))
            }
            serde_json::Value::Array(_) => {
                let err_array: Vec<String> = serde_json::value::from_value(err).ok()?;
                Some((None, Self::image_error(err_array)))
            }
            _ => None,
        }
    }

    pub fn validate(&self) -> Result<(), IdologyError::Error> {
        // see if we have any errors related to API requests
        if let Some((Some(api_error), _)) = self.error() {
            return Err(api_error.into());
        }
        // make sure we have a result
        self.capture_result()?;

        Ok(())
    }

    pub fn needs_retry(&self) -> bool {
        self.capture_result()
            .map(|r| {
                matches!(
                    r,
                    IdologyScanOnboardingCaptureResult::ImageError
                        | IdologyScanOnboardingCaptureResult::InternalError
                )
            })
            .unwrap_or_default()
    }
}

/// Represents the OCRd information off of the license
#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct CaptureData {
    pub first_name: Option<String>,
    pub middle_name: Option<String>,
    pub last_name: Option<String>,
    pub last_name2: Option<String>,
    pub last_name3: Option<String>,
    pub street_address: Option<String>,
    pub street_address2: Option<String>,
    pub street_address3: Option<String>,
    pub street_address4: Option<String>,
    pub street_address5: Option<String>,
    pub street_address6: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub zip: Option<i32>,
    pub country: Option<String>,
    pub month_of_birth: Option<String>,
    pub day_of_birth: Option<i32>,
    pub year_of_birth: Option<i32>,
    pub expiration_date: Option<String>,
    pub issuance_date: Option<String>,
    pub document_number: Option<i64>,
    pub document_type: Option<String>,
    pub capture_confidence_score: Option<i32>,
    pub capture_facial_match_score: Option<i32>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test() {
        let json_no_err = json!({"response": {"query-id": 1234}});
        // Test with no errors
        let resp_no_errors = parse_response(json_no_err).unwrap();
        assert_eq!(resp_no_errors.response.error(), None);

        // Test with api error
        let json_api_err = json!({"response": {"query-id": 1234, "error": "Invalid Username or Password"}});
        let resp_api_error = parse_response(json_api_err).unwrap();
        assert_eq!(
            resp_api_error.response.error(),
            Some((Some(RequestError::InvalidUserNameOrPassword), vec![]))
        );

        // test with image errors
        let json_image_err = json!({"response": {"query-id": 1234, "error": ["Image Too Small", "Document Too Small", "IDK"]}});
        let resp_image_error = parse_response(json_image_err).unwrap();
        assert_eq!(
            resp_image_error.response.error(),
            Some((
                None,
                vec![
                    IdologyImageCaptureErrors::ImageTooSmall,
                    IdologyImageCaptureErrors::DocumentTooSmall,
                    IdologyImageCaptureErrors::ImageError
                ]
            ))
        );
    }
}
