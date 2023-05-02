use newtypes::PiiString;

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
    pub id_validation: Option<serde_json::Value>,
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl APIResponseToIncodeError for FetchScoresResponse {
    fn to_error(&self) -> Option<Error> {
        self.error.clone()
    }
}
