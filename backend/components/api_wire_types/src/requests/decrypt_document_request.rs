use chrono::{DateTime, Utc};
use newtypes::{flat_api_object_map_type, DataIdentifier, DocumentKind, IdDocKind};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

use crate::UserFacingCollectedDocumentStatus;

// GET
flat_api_object_map_type!(
    GetIdentityDocumentForDecryptResponse<IdDocKind, bool>,
    description="A key-value map indicating what document_types are present",
    example=r#"{ "driver_license": true, "passport": false }"#
);

/// POST
#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct DecryptIdentityDocumentRequest {
    /// Deprecated. type of document for decryption
    pub document_type: Option<IdDocKind>,
    /// type of document for decryption, represented by the fully-qualified DataIdentifier
    pub document_identifier: Option<DataIdentifier>,
    // Reason for the decryption
    pub reason: String,
    #[serde(default)]
    pub include_selfie: bool,
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
    pub status: UserFacingCollectedDocumentStatus,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct DecryptIdentityDocumentResponse {
    // type of document
    pub document_type: IdDocKind,
    // image data
    pub images: Vec<ImageData>,
}

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct DecryptDocumentRequest {
    pub kind: DocumentKind,
    pub reason: String,
}
