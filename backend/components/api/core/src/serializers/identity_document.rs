use db::models::{document_request::DocumentRequest, identity_document::IdentityDocument};

use crate::utils::db2api::DbToApi;

impl DbToApi<(IdentityDocument, DocumentRequest)> for api_wire_types::IdentityDocumentTimelineEvent {
    fn from_db((identity_doc, document_request): (IdentityDocument, DocumentRequest)) -> Self {
        let IdentityDocument {
            document_type,
            status,
            ..
        } = identity_doc;

        let DocumentRequest {
            should_collect_selfie,
            ..
        } = document_request;

        Self {
            status,
            document_type: document_type.into(),
            selfie_collected: should_collect_selfie,
        }
    }
}
