use newtypes::Uuid;

#[derive(Debug, Clone, serde::Serialize)]
pub struct FpResponseErrorInfo {
    pub message: String,
    pub status_code: u16,
    pub support_id: Uuid,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponseError {
    pub error: FpResponseErrorInfo,
}
