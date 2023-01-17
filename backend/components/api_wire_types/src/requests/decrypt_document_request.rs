use newtypes::{flat_api_object_map_type, IdDocKind};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

// GET
flat_api_object_map_type!(
    GetIdentityDocumentForDecryptResponse<IdDocKind, bool>,
    description="A key-value map indicating what document_types are present",
    example=r#"{ "driver_license": true, "passport": false }"#
);

/// POST
#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct DecryptIdentityDocumentRequest {
    // type of document for decryption
    pub document_type: IdDocKind,
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
    pub document_type: IdDocKind,
    // image data
    pub images: Vec<ImageData>,
}
