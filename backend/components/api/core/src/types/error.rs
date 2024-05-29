use newtypes::{
    ErrorMessage,
    Uuid,
};
use serde_json::Value;

#[derive(Debug, Clone, serde::Serialize)]
pub struct FpResponseErrorInfo {
    pub message: ErrorMessage,
    pub code: Option<String>, // frontend will use to generate translated error messages
    pub context: Option<Value>, // any context needed for composing an error message from error_code
    pub status_code: u16,
    pub support_id: Uuid,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponseError {
    pub error: FpResponseErrorInfo,
}
