use newtypes::flat_api_object_map_type;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

// GET
flat_api_object_map_type!(
    GetIdentityDocumentForDecryptResponse<String, bool>,
    description="A key-value map indicating what document_types are present",
    example=r#"{ "drivers_license": true, "passport": false }"#
);
#[derive(Debug, Deserialize, Clone, Apiv2Schema)]
pub struct GetQueryParam {
    pub document_types: Option<String>,
}

/// POST
#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct DecryptIdentityDocumentRequest {
    // type of document for decryption
    pub document_type: String,
    // Reason for the decryption
    pub reason: String,
}
#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct ImageData {
    // Base64 encoded image
    pub front: String,
    // Base64 encoded string
    pub back: Option<String>,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct DecryptIdentityDocumentResponse {
    // type of document
    pub document_type: String,
    // image data
    pub images: Vec<ImageData>,
}
