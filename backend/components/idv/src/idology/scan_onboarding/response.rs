use crate::idology::{
    error as IdologyError,
    response_common::{IDologyQualifiers, KeyResponse},
};

pub fn parse_response(value: serde_json::Value) -> Result<APIResponse, IdologyError::Error> {
    let response: APIResponse = serde_json::value::from_value(value)?;
    Ok(response)
}
#[derive(Debug, Clone, serde::Deserialize)]
pub struct APIResponse {
    pub response: ScanOnboardingResponse,
}
#[derive(Debug, Clone, serde::Deserialize)]
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
    pub capture_decision: Option<String>,
    pub qualifiers: Option<IDologyQualifiers>,
    // TODO: put this back in once we have a story around PII in raw vendor responses
    // pub capture_data: Option<CaptureData>,
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
