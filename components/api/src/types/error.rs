
#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponseErrorInfo {
    pub message: String,
    pub status_code: u16,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponseError {
    pub error: ApiResponseErrorInfo
}