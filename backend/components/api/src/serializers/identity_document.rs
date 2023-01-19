use db::models::{document_request::DocumentRequest, identity_document::IdentityDocument};

use crate::utils::db2api::DbToApi;

impl DbToApi<(IdentityDocument, DocumentRequest)> for api_wire_types::IdentityDocumentTimelineEvent {
    fn from_db((identity_doc, document_request): (IdentityDocument, DocumentRequest)) -> Self {
        let IdentityDocument { id, created_at, .. } = identity_doc;

        let DocumentRequest { status, .. } = document_request;

        Self {
            id,
            timestamp: created_at,
            status,
        }
    }
}
