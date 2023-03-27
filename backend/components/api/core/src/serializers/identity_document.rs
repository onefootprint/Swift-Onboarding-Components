use db::models::{document_request::DocumentRequest, identity_document::IdentityDocument};
use newtypes::DataIdentifier;

use crate::utils::db2api::DbToApi;

impl DbToApi<(IdentityDocument, DocumentRequest)> for api_wire_types::IdentityDocumentTimelineEvent {
    fn from_db((identity_doc, document_request): (IdentityDocument, DocumentRequest)) -> Self {
        let IdentityDocument {
            id,
            created_at,
            document_type,
            ..
        } = identity_doc;

        let DocumentRequest {
            status,
            should_collect_selfie,
            ..
        } = document_request;

        Self {
            id,
            timestamp: created_at,
            status,
            document_type,
            document_identifier: DataIdentifier::IdDocument(document_type),
            selfie_collected: should_collect_selfie,
        }
    }
}
