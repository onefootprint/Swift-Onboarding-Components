use api_wire_types::{DocumentImageError, UploadSource};
use db::models::{
    data_lifetime::DataLifetime, document::Document, document_request::DocumentRequest,
    document_upload::DocumentUpload,
};
use newtypes::{DocumentKind, DocumentScanDeviceType, DocumentSide};

use crate::{
    errors::ApiResult,
    utils::db2api::{DbToApi, TryDbToApi},
};

/// Document info from Documents, created via hosted bifrost
pub type DocumentInfo = (Document, DocumentRequest, Vec<DocumentUpload>);
/// Document info from the vault, created via API
pub type DocumentVaultInfo = (DocumentKind, Vec<(DocumentSide, DataLifetime)>);

impl TryDbToApi<DocumentInfo> for api_wire_types::Document {
    fn try_from_db((doc, dr, uploads): DocumentInfo) -> ApiResult<Self> {
        let uploads = uploads
            .into_iter()
            .map(|u| (&doc, &dr, u))
            .map(api_wire_types::DocumentUpload::try_from_db)
            .collect::<ApiResult<_>>()?;

        let Document {
            created_at,
            document_type,
            completed_seqno,
            document_score,
            selfie_score,
            ocr_confidence_score,
            status,
            review_status,
            device_type,
            curp_completed_seqno,
            ..
        } = doc;

        let result = Self {
            kind: document_type,
            started_at: Some(created_at),
            status: Some(status),
            review_status: Some(review_status),
            completed_version: completed_seqno,
            curp_completed_version: curp_completed_seqno,
            uploads,
            document_score,
            selfie_score,
            ocr_confidence_score,
            // TODO: Should we have default here? I think so
            upload_source: device_type.unwrap_or(DocumentScanDeviceType::Mobile).into(),
        };
        Ok(result)
    }
}

impl<'a> TryDbToApi<(&'a Document, &'a DocumentRequest, DocumentUpload)> for api_wire_types::DocumentUpload {
    fn try_from_db(
        (doc, dr, upload): (&'a Document, &'a DocumentRequest, DocumentUpload),
    ) -> ApiResult<Self> {
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
        let identifier = doc.identifier(&dr.config, upload.side)?;
        let result = Self {
            timestamp: created_at,
            side,
            version: created_seqno,
            failure_reasons,
            is_extra_compressed: upload.is_extra_compressed,
            identifier,
        };
        Ok(result)
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
            review_status: None,
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
            identifier: dl.kind,
        }
    }
}

impl DbToApi<Document> for api_wire_types::PublicDocument {
    fn from_db(id_doc: Document) -> Self {
        Self {
            document_type: id_doc.vaulted_document_type.unwrap_or(id_doc.document_type), // unwrap_or for backwards compat
            created_at: id_doc.created_at,
        }
    }
}
