use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct DocumentRequest {
    // base64 encoded image bytes
    pub front_image: String,
    // base64 encoded image bytes
    pub back_image: String,
    // type of document
    pub document_type: String,
    // country of document
    pub country_code: String,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
#[serde(tag = "kind")]
#[serde(rename_all = "snake_case")]
pub enum DocumentResponseStatus {
    Pending,
    Complete,
    Error,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum DocumentErrorReason {
    // TODO(argoff): These are just temporary values to test frontend
    Blurry,
    Invalid,
}

#[derive(Debug, Apiv2Schema, serde::Serialize)]
pub struct DocumentResponse {
    pub status: DocumentResponseStatus,
    pub front_image_error: Option<DocumentErrorReason>,
    pub back_image_error: Option<DocumentErrorReason>,
}
