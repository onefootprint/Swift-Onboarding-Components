use super::IncodeClientErrorCustomFailureReasons;
use newtypes::IncodeFailureReason;
use newtypes::PiiString;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStartResponse {
    // token: String. Up to 256 characters. Internal JWT token used for the future subsequent calls.
    // !Important!:
    //    It is the value for X-Incode-Hardware-Id header in all other calls.
    pub token: PiiString, // TODO: this isn't PII?
    // interviewCode: String. 6 characters. This value is used for connecting to conference call.
    pub interview_code: Option<String>,
    // interviewId: String. 24 characters. Identifies the onboarding session that is initialized. Can be used
    // for fetching data about that session in future calls.
    pub interview_id: String,
    // flowType: String, optional (only if configurationId is sent in request). Type of the flow used. Could
    // be flow (in most cases), or legacy type configuration (not used anymore).
    pub flow_type: Option<String>,
    // idCaptureTimeout: Integer. Number of seconds after which manual capture button should be shown to the
    // user, while capturing ID.
    pub id_capture_timeout: Option<i32>,
    // idCaptureRetries: Integer. Number of ID captures after which user should be taken to next screen.
    pub id_capture_retries: Option<i32>,
    // selfieCaptureTimeout: Integer. Number of seconds after which manual capture button should be shown to
    // the user, while capturing selfie.
    pub selfie_capture_timeout: Option<i32>,
    // selfieCaptureRetries: Integer. Number of selfie captures after which user should be taken to next
    // screen.
    pub selfie_capture_retries: Option<i32>,
    // curpValidationRetries: Integer. Number of curp validations after which user should be taken to next
    // screen. (only for Mexico)
    pub curp_validation_retries: Option<i32>,
    // clientId: String. Customer specific clientId that corresponds to api key.
    pub client_id: Option<PiiString>, // TODO: this isn't PII?
    // env: Sting. Server environment. Could be one of: stage, demo, saas.
    pub env: Option<String>,
    // existingSession: Boolean. It's true if interviewId corresponds to an existing Onboarding Session.
    pub existing_session: Option<bool>,
    // Some 4xx errors that could be handled programmatically include status of an error and message that
    // briefly explains the error reported.
    #[serde(flatten)]
    pub error: Option<Error>,
}

impl IncodeClientErrorCustomFailureReasons for OnboardingStartResponse {
    fn custom_failure_reasons(_error: Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

/// Common Error struct that will occur across multiple Incode endpoints
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct Error {
    pub timestamp: i64,
    pub status: i32,
    pub error: String,
    pub message: Option<String>,
    pub path: Option<String>,
}
impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "IncodeAPIResponseError {}: {} in {}>",
            self.error,
            self.message.as_ref().unwrap_or(&"".to_string()),
            self.path.as_ref().unwrap_or(&"".to_string())
        )
    }
}
