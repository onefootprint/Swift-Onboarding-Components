use db::models::{document_request::DocumentRequest, identity_document::IdentityDocument};
use newtypes::DocumentScanDeviceType;

use crate::utils::db2api::DbToApi;

impl DbToApi<(IdentityDocument, DocumentRequest)> for api_wire_types::DocumentUploadedTimelineEvent {
    fn from_db((identity_doc, document_request): (IdentityDocument, DocumentRequest)) -> Self {
        let IdentityDocument {
            document_type,
            status,
            device_type,
            ..
        } = identity_doc;

        Self {
            status,
            document_type,
            device_type: device_type.unwrap_or(DocumentScanDeviceType::Mobile),
            config: document_request.config,
        }
    }
}
