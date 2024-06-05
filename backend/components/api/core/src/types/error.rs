use newtypes::{
    ErrorMessage,
    Uuid,
};
use serde_json::Value;

#[derive(Debug, Clone, serde::Serialize)]
pub struct FpResponseErrorInfo {
    pub message: ErrorMessage,
    #[serde(skip_serializing_if = "Option::is_none")]
    /// Frontend will use to generate translated error messages.
    /// Or, some tenant-facing errors have codes to allow them to more easily match on errors
    pub code: Option<String>,
    /// Any freeform JSON context to give more information on the error
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<Value>,
    pub status_code: u16,
    pub support_id: Uuid,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponseError {
    pub error: FpResponseErrorInfo,
}
