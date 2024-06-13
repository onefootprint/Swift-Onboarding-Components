use newtypes::Uuid;
use serde_json::Value;
#[derive(Debug, Clone, serde::Serialize)]
pub struct ApiResponseError {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
    /// Any freeform JSON context to give more information on the error
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<Value>,
    pub support_id: Uuid,
}
