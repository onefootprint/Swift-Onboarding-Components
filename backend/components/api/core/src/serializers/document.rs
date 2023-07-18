use api_wire_types::DocumentImageError;
use db::models::{
    document_request::DocumentRequest, document_upload::DocumentUpload, identity_document::IdentityDocument,
};

use crate::utils::db2api::DbToApi;

pub type DocumentInfo = (IdentityDocument, DocumentRequest, Vec<DocumentUpload>);

impl DbToApi<DocumentInfo> for api_wire_types::Document {
    fn from_db((identity_doc, document_request, uploads): DocumentInfo) -> Self {
        let IdentityDocument {
            created_at,
            document_type,
            completed_seqno,
            ..
        } = identity_doc;

        let DocumentRequest { status, .. } = document_request;

        let uploads = uploads
            .into_iter()
            .map(api_wire_types::DocumentUpload::from_db)
            .collect();
        Self {
            kind: document_type.into(),
            started_at: created_at,
            status,
            completed_version: completed_seqno,
            uploads,
        }
    }
}

impl DbToApi<DocumentUpload> for api_wire_types::DocumentUpload {
    fn from_db(upload: DocumentUpload) -> Self {
        let DocumentUpload {
            created_at,
            side,
            created_seqno,
            failure_reasons,
            ..
        } = upload;

        let failure_reasons = failure_reasons
            .into_iter()
            .map(DocumentImageError::from)
            .collect();
        Self {
            timestamp: created_at,
            side,
            version: created_seqno,
            failure_reasons,
        }
    }
}
