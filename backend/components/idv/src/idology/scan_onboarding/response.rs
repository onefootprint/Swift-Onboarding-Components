use crate::idology::{
    common::response::{from_string_or_int, IDologyQualifiers, IdologyResponseHelpers, KeyResponse},
    error as IdologyError,
    IdologyError::RequestError,
};
use newtypes::{
    idology::{
        IdologyImageCaptureErrors, IdologyScanOnboardingCaptureDecision, IdologyScanOnboardingCaptureResult,
    },
    ScrubbedPiiString,
};

pub fn parse_response(value: serde_json::Value) -> Result<ScanOnboardingAPIResponse, IdologyError::Error> {
    let response: ScanOnboardingAPIResponse = serde_json::value::from_value(value)?;
    Ok(response)
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ScanOnboardingAPIResponse {
    pub response: ScanOnboardingResponse,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
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
    pub capture_data: Option<CaptureData>,
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
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub struct CaptureData {
    pub first_name: Option<ScrubbedPiiString>,
    pub middle_name: Option<ScrubbedPiiString>,
    pub last_name: Option<ScrubbedPiiString>,
    pub last_name2: Option<ScrubbedPiiString>,
    pub last_name3: Option<ScrubbedPiiString>,
    pub street_address: Option<ScrubbedPiiString>,
    pub street_address2: Option<ScrubbedPiiString>,
    pub street_address3: Option<ScrubbedPiiString>,
    pub street_address4: Option<ScrubbedPiiString>,
    pub street_address5: Option<ScrubbedPiiString>,
    pub street_address6: Option<ScrubbedPiiString>,
    pub city: Option<ScrubbedPiiString>,
    pub state: Option<ScrubbedPiiString>,
    // #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    // shown in docs as String but real responses have given us ints
    pub zip: Option<ScrubbedPiiString>,
    pub country: Option<ScrubbedPiiString>,
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    // shown in docs as String, proofing against the possibility a response gives us int
    pub month_of_birth: Option<ScrubbedPiiString>,
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    // shown in docs as String, proofing against the possibility a response gives us int
    pub day_of_birth: Option<ScrubbedPiiString>,
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    // shown in docs as String but real responses have given us ints
    pub year_of_birth: Option<ScrubbedPiiString>,
    pub expiration_date: Option<ScrubbedPiiString>,
    pub issuance_date: Option<ScrubbedPiiString>,
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    // shown in docs as String, proofing against the possibility a response gives us int
    pub document_number: Option<ScrubbedPiiString>,
    pub document_type: Option<String>,
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    pub capture_confidence_score: Option<i32>,
    #[serde(default)]
    #[serde(deserialize_with = "from_string_or_int")]
    pub capture_facial_match_score: Option<i32>,
}

#[cfg(test)]
mod tests {
    use crate::ParsedResponse;

    use super::*;
    use newtypes::{PiiString, ScrubbedPiiString};
    use serde_json::json;
    use test_case::test_case;

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

    #[test_case(json!("99123") => Some(ScrubbedPiiString::new(PiiString::new("99123".to_owned()))))]
    #[test_case(json!(91912) => Some(ScrubbedPiiString::new(PiiString::new("91912".to_owned()))))]
    #[test_case(json!(null) => None)]
    fn test_can_handle_string_or_int_deserialization(
        zip_json: serde_json::Value,
    ) -> Option<ScrubbedPiiString> {
        // For god knows why reason, Idology will sometimes send `zip` and other fields as an int and sometimes send as a String so we need to be able to handle both cases without throw a deser error

        let json_res = json!({"response": {"capture-data":{"zip":zip_json}}});
        parse_response(json_res)
            .expect("deserialization should not error")
            .response
            .capture_data
            .unwrap()
            .zip
    }

    #[test]
    fn test_serialize_pii() {
        let res_json = json!({"response":
            {"capture-data":
                {
                    "capture-confidence-score":87,
                    "capture-facial-match-score":92,
                    "city":"San Francisco",
                    "country":"America",
                    "document-number":"Y643534",
                    "document-type":"passport",
                    "expiration-date":"02-02-2032",
                    "issuance-date":"03-03-2033",
                    "first-name":"Bob",
                    "middle-name":"Bobby",
                    "last-name":"Boberto",
                    "last-name2":"The",
                    "last-name3":"Third",
                    "day-of-birth":"01",
                    "month-of-birth":"05",
                    "year-of-birth":1988,
                    "state":"California",
                    "street-address":"123 Bob St",
                    "street-address2":"Apt 12",
                    "street-address3":"Floor 3",
                    "street-address4":"Door 7",
                    "street-address5":"Room 2",
                    "street-address6":"Bunk 1",
                    "zip":94123
                },
            "capture-decision":{"key": "result.scan.capture.id.approved", "message": "ID Approved"},
            "capture-result":{"key": "capture.completed", "message": "Completed"},
            "qualifiers": {"qualifier": {"key": "resultcode.ip.not.located","message": "IP Not Located"}},
            "error":null,
            "query-id":12345
        }});

        let parsed_response = parse_response(res_json)
            .map(ParsedResponse::IDologyScanOnboarding)
            .unwrap();

        let scrubbed_json = serde_json::to_value(&parsed_response).unwrap();

        assert_eq!(
            scrubbed_json,
            json!({"response":
                {"capture-data":
                    {
                        "capture-confidence-score":87,
                        "capture-facial-match-score":92,
                        "city":"<SCRUBBED>",
                        "country":"<SCRUBBED>",
                        "document-number":"<SCRUBBED>",
                        "document-type":"passport",
                        "expiration-date":"<SCRUBBED>",
                        "issuance-date":"<SCRUBBED>",
                        "first-name":"<SCRUBBED>",
                        "middle-name":"<SCRUBBED>",
                        "last-name":"<SCRUBBED>",
                        "last-name2":"<SCRUBBED>",
                        "last-name3":"<SCRUBBED>",
                        "day-of-birth":"<SCRUBBED>",
                        "month-of-birth":"<SCRUBBED>",
                        "year-of-birth":"<SCRUBBED>",
                        "state":"<SCRUBBED>",
                        "street-address":"<SCRUBBED>",
                        "street-address2":"<SCRUBBED>",
                        "street-address3":"<SCRUBBED>",
                        "street-address4":"<SCRUBBED>",
                        "street-address5":"<SCRUBBED>",
                        "street-address6":"<SCRUBBED>",
                        "zip":"<SCRUBBED>"
                    },
                "capture-decision":{"key": "result.scan.capture.id.approved"},
                "capture-result":{"key": "capture.completed"},
                "qualifiers": {"qualifier": {"key": "resultcode.ip.not.located","message": "IP Not Located"}},
                "error":null,
                "query-id":12345
            }})
        );
    }
}
