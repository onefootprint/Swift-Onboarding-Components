use db::models::{document_request::DocumentRequest, identity_document::IdentityDocument};
use newtypes::DocumentScanDeviceType;

use crate::utils::db2api::DbToApi;

impl DbToApi<(IdentityDocument, DocumentRequest)> for api_wire_types::DocumentUploadedTimelineEvent {
    fn from_db((identity_doc, document_request): (IdentityDocument, DocumentRequest)) -> Self {
        let skip_selfie = identity_doc.should_skip_selfie();
        let IdentityDocument {
            document_type,
            status,
            device_type,
            ..
        } = identity_doc;

        let selfie_collected = document_request.should_collect_selfie() && !skip_selfie;

        Self {
            status,
            document_type,
            selfie_collected,
            device_type: device_type.unwrap_or(DocumentScanDeviceType::Mobile),
            config: document_request.config,
        }
    }
}
