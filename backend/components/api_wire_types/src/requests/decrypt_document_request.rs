use chrono::{DateTime, Utc};
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
    #[serde(default)]
    pub include_selfie: bool,
}

/// This status is used to group and display decrypted documents in the dashboard
/// It is derived from `DocumentRequestStatus` in that it represents whether or not the document
/// was successfully uploaded AND usable by our vendors to make a determination.
///
/// It does NOT represent whether the document was verified or not.
#[derive(Debug, Clone, Apiv2Schema, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum DecryptedDocumentStatus {
    Success,
    Fail,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct ImageData {
    // Base64 encoded image
    pub front: String,
    // Base64 encoded string
    pub back: Option<String>,
    // Base64 encoded string
    pub selfie: Option<String>,
    // the time the IdentityDocument was created in our database
    pub uploaded_at: DateTime<Utc>,
    pub status: DecryptedDocumentStatus,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct DecryptIdentityDocumentResponse {
    // type of document
    pub document_type: IdDocKind,
    // image data
    pub images: Vec<ImageData>,
}
