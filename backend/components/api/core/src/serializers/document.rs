use api_wire_types::{DocumentImageError, UploadSource};
use db::models::{
    data_lifetime::DataLifetime, document_upload::DocumentUpload, identity_document::IdentityDocument,
};
use newtypes::{DocumentScanDeviceType, DocumentSide, IdDocKind};

use crate::utils::db2api::DbToApi;

/// Document info from IdentityDocuments, created via hosted bifrost
pub type DocumentInfo = (IdentityDocument, Vec<DocumentUpload>);
/// Document info from the vault, created via API
pub type DocumentVaultInfo = (IdDocKind, Vec<(DocumentSide, DataLifetime)>);

impl DbToApi<DocumentInfo> for api_wire_types::Document {
    fn from_db((identity_doc, uploads): DocumentInfo) -> Self {
        let IdentityDocument {
            created_at,
            document_type,
            completed_seqno,
            document_score,
            selfie_score,
            ocr_confidence_score,
            status,
            device_type,
            curp_completed_seqno,
            ..
        } = identity_doc;

        let uploads = uploads
            .into_iter()
            .map(api_wire_types::DocumentUpload::from_db)
            .collect();

        Self {
            kind: document_type,
            started_at: Some(created_at),
            status: Some(status),
            completed_version: completed_seqno,
            curp_completed_version: curp_completed_seqno,
            uploads,
            document_score,
            selfie_score,
            ocr_confidence_score,
            // TODO: Should we have default here? I think so
            upload_source: device_type.unwrap_or(DocumentScanDeviceType::Mobile).into(),
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
            is_extra_compressed: upload.is_extra_compressed,
        }
    }
}

impl DbToApi<DocumentVaultInfo> for api_wire_types::Document {
    fn from_db((kind, uploads): DocumentVaultInfo) -> Self {
        let uploads = uploads
            .into_iter()
            .map(api_wire_types::DocumentUpload::from_db)
            .collect();

        Self {
            kind,
            started_at: None,
            status: None,
            completed_version: None,
            curp_completed_version: None,
            uploads,
            document_score: None,
            selfie_score: None,
            ocr_confidence_score: None,
            upload_source: UploadSource::Api,
        }
    }
}

impl DbToApi<(DocumentSide, DataLifetime)> for api_wire_types::DocumentUpload {
    fn from_db((side, dl): (DocumentSide, DataLifetime)) -> Self {
        Self {
            timestamp: dl.created_at,
            side,
            version: dl.created_seqno,
            failure_reasons: vec![],
            is_extra_compressed: false,
        }
    }
}

impl DbToApi<IdentityDocument> for api_wire_types::PublicDocument {
    fn from_db(id_doc: IdentityDocument) -> Self {
        Self {
            document_type: id_doc.vaulted_document_type.unwrap_or(id_doc.document_type), // unwrap_or for backwards compat
            created_at: id_doc.created_at,
        }
    }
}
