use newtypes::{ErrorMessage, Uuid};

#[derive(Debug, Clone, serde::Serialize)]
pub struct FpResponseErrorInfo {
    pub message: ErrorMessage,
    pub status_code: u16,
    pub support_id: Uuid,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponseError {
    pub error: FpResponseErrorInfo,
}
