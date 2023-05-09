use std::collections::HashMap;

use crate::incode::error::Error as IncodeError;
use newtypes::{
    incode::{IncodeStatus, IncodeTest},
    PiiString,
};

use super::APIResponseToIncodeError;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStartResponse {
    // token: String. Up to 256 characters. Internal JWT token used for the future subsequent calls.
    // !Important!:
    //    It is the value for X-Incode-Hardware-Id header in all other calls.
    pub token: PiiString,
    // interviewCode: String. 6 characters. This value is used for connecting to conference call.
    pub interview_code: Option<String>,
    // interviewId: String. 24 characters. Identifies the onboarding session that is initialized. Can be used for fetching data about that session in future calls.
    pub interview_id: String,
    // flowType: String, optional (only if configurationId is sent in request). Type of the flow used. Could be flow (in most cases), or legacy type configuration (not used anymore).
    pub flow_type: Option<String>,
    // idCaptureTimeout: Integer. Number of seconds after which manual capture button should be shown to the user, while capturing ID.
    pub id_capture_timeout: Option<i32>,
    // idCaptureRetries: Integer. Number of ID captures after which user should be taken to next screen.
    pub id_capture_retries: Option<i32>,
    // selfieCaptureTimeout: Integer. Number of seconds after which manual capture button should be shown to the user, while capturing selfie.
    pub selfie_capture_timeout: Option<i32>,
    // selfieCaptureRetries: Integer. Number of selfie captures after which user should be taken to next screen.
    pub selfie_capture_retries: Option<i32>,
    // curpValidationRetries: Integer. Number of curp validations after which user should be taken to next screen. (only for Mexico)
    pub curp_validation_retries: Option<i32>,
    // clientId: String. Customer specific clientId that corresponds to api key.
    pub client_id: Option<PiiString>,
    // env: Sting. Server environment. Could be one of: stage, demo, saas.
    pub env: Option<String>,
    // existingSession: Boolean. It's true if interviewId corresponds to an existing Onboarding Session.
    pub existing_session: Option<bool>,
    // Some 4xx errors that could be handled programmatically include status of an error and message that briefly explains the error reported.
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl APIResponseToIncodeError for OnboardingStartResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

/// Common Error struct that will occur across multiple Incode endpoints
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct Error {
    pub timestamp: i64,
    pub status: i32,
    pub error: String,
    pub message: String,
    pub path: String,
}
impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "IncodeAPIResponseError {}: {} in {}>",
            self.error, self.message, self.path
        )
    }
}

/// Response we get back from adding a document image
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddSideResponse {
    pub classification: Option<bool>,
    pub correct_glare: Option<bool>,
    pub correct_sharpness: Option<bool>,
    pub country_code: Option<String>,
    pub glare: Option<i32>,
    pub horizontal_resolution: Option<i32>,
    pub issue_name: Option<String>,
    pub issue_year: Option<i32>,
    pub readability: Option<bool>,
    pub session_status: Option<String>,
    pub sharpness: Option<i32>,
    pub type_of_id: Option<String>,
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl APIResponseToIncodeError for AddSideResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

/// Response we get from telling Incode to process the image
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessIdResponse {
    pub success: Option<bool>,
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl APIResponseToIncodeError for ProcessIdResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

/// Response from fetch scores
// TODO!
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FetchScoresResponse {
    pub id_validation: Option<IdValidation>,
    pub liveness: Option<serde_json::Value>,
    pub face_recognition: Option<serde_json::Value>,
    pub id_ocr_confidence: Option<IdOcrConfidence>,
    pub overall: Option<IdTest>,

    #[serde(flatten)]
    pub error: Option<Error>,
}

impl FetchScoresResponse {
    pub fn overall_score(&self) -> Result<IncodeStatus, IncodeError> {
        self.overall
            .as_ref()
            .and_then(|o| o.status.as_ref())
            .and_then(|s| IncodeStatus::try_from(s.as_str()).ok())
            .ok_or(IncodeError::AssertionError("missing score status".into()))
    }

    pub fn get_id_tests(&self) -> HashMap<IncodeTest, IncodeStatus> {
        let photo_sec_tests = self
            .id_validation
            .as_ref()
            .and_then(|i| i.photo_security_and_quality.as_ref())
            .cloned()
            .unwrap_or(vec![]);

        let id_specific_tests = self
            .id_validation
            .as_ref()
            .and_then(|i| i.id_specific.as_ref())
            .cloned()
            .unwrap_or(vec![]);

        let custom_field_tests = self
            .id_validation
            .as_ref()
            .and_then(|i: &IdValidation| i.custom_fields.as_ref())
            .cloned()
            .unwrap_or(vec![]);

        photo_sec_tests
            .into_iter()
            .chain(id_specific_tests.into_iter())
            .chain(custom_field_tests.into_iter())
            .filter_map(|test| {
                let (key, status) = match (test.key, test.status) {
                    (Some(key), Some(status)) => (
                        IncodeTest::try_from(key.as_str()).ok(),
                        IncodeStatus::try_from(status.as_str()).ok(),
                    ),
                    _ => (None, None),
                };

                key.and_then(|k| status.map(|s| (k, s)))
            })
            .collect()
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdValidation {
    pub photo_security_and_quality: Option<Vec<IdTest>>,
    pub id_specific: Option<Vec<IdTest>>,
    pub custom_fields: Option<Vec<IdTest>>,
    pub applied_rule: Option<serde_json::Value>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdOcrConfidence {
    pub overall_confidence: Option<IdTest>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IdTest {
    pub value: Option<String>,
    pub status: Option<String>,
    pub key: Option<String>,
}

impl APIResponseToIncodeError for FetchScoresResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}

#[cfg(test)]
mod tests {
    use newtypes::incode::{IncodeStatus, IncodeTest};

    use super::FetchScoresResponse;

    #[test]
    pub fn test_parse_fetch_scores() {
        let raw_response = serde_json::json!({"idValidation":{"photoSecurityAndQuality":[{"value":"PASSED","status":"OK","key":"tamperCheck"},{"value":"PASSED","status":"OK","key":"postitCheck"}, {"value":"PASSED","status":"OK","key":"alignment"},{"value":"OK","status":"OK","key":"screenIdLiveness"},{"value":"OK","status":"OK","key":"paperIdLiveness"},{"value":"PASSED","status":"OK","key":"idAlreadyUsedCheck"},{"value":"96","status":"OK","key":"balancedLightFront"},{"value":"99","status":"OK","key":"sharpnessFront"}],"idSpecific":[{"value":"100","status":"WARN","key":"documentClassification"},{"value":"100","status":"OK","key":"birthDateValidity"},{"value":"100","status":"OK","key":"visiblePhotoFeatures"},{"value":"100","status":"FAIL","key":"expirationDateValidity"},{"value":"100","status":"OK","key":"documentExpired"}],"customFields":[{"value":"firstNameMatch","status":"FAIL","key":"firstNameMatch"},{"value":"lastNameMatch","status":"FAIL","key":"lastNameMatch"}],"appliedRule":null},"liveness":null,"faceRecognition":null,"idOcrConfidence":{"overallConfidence":{"value":"99.0","status":"OK","key":null}},"overall":{"value":"100.0","status":"OK","key":null}});

        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let parsed_tests = parsed.get_id_tests();

        // Check a few tests
        assert_eq!(
            parsed_tests.get(&IncodeTest::TamperCheck).unwrap(),
            &IncodeStatus::Ok
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::ScreenIdLiveness).unwrap(),
            &IncodeStatus::Ok
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::PaperIdLiveness).unwrap(),
            &IncodeStatus::Ok
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::ExpirationDateValidity).unwrap(),
            &IncodeStatus::Fail
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::PostitCheck).unwrap(),
            &IncodeStatus::Ok
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::DocumentClassification).unwrap(),
            &IncodeStatus::Warn
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::BirthDateValidity).unwrap(),
            &IncodeStatus::Ok
        );

        assert_eq!(
            parsed_tests.get(&IncodeTest::FirstNameMatch).unwrap(),
            &IncodeStatus::Fail
        );
        assert_eq!(
            parsed_tests.get(&IncodeTest::LastNameMatch).unwrap(),
            &IncodeStatus::Fail
        );

        // Overall score
        assert_eq!(parsed.overall_score().unwrap(), IncodeStatus::Ok)
    }
}
