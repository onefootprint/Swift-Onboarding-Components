use newtypes::{ErrorMessage, Uuid};

#[derive(Debug, Clone, serde::Serialize)]
pub struct FpResponseErrorInfo {
    pub message: ErrorMessage,
    pub error_code: Option<String>, // frontend will use to generate translated error messages
    pub status_code: u16,
    pub support_id: Uuid,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponseError {
    pub error: FpResponseErrorInfo,
}
