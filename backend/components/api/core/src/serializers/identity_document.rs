use db::models::{document::Document, document_request::DocumentRequest};
use newtypes::DocumentScanDeviceType;

use crate::utils::db2api::DbToApi;

impl DbToApi<(Document, DocumentRequest)> for api_wire_types::DocumentUploadedTimelineEvent {
    fn from_db((identity_doc, document_request): (Document, DocumentRequest)) -> Self {
        let Document {
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
