use crate::schema::document_upload;
use crate::DbResult;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::{DocumentSide, DocumentUploadId, IdentityDocumentId, SealedVaultDataKey};

pub type S3Url = String;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = identity_document_upload)]
/// Represents an individual image uploaded for a given identity document
pub struct DocumentUpload {
    pub id: DocumentUploadId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub document_id: IdentityDocumentId,
    pub side: DocumentSide,
    pub s3_url: S3Url,
    pub e_data_key: SealedVaultDataKey,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = document_upload)]
struct NewDocumentUploadRow {
    pub document_id: IdentityDocumentId,
    pub side: DocumentSide,
    pub s3_url: S3Url,
    pub e_data_key: SealedVaultDataKey,
    pub created_at: DateTime<Utc>,
}

impl DocumentUpload {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        document_id: IdentityDocumentId,
        side: DocumentSide,
        s3_url: S3Url,
        e_data_key: SealedVaultDataKey,
    ) -> DbResult<Self> {
        // Deactivate existing upload, if any
        Self::deactivate(conn, &document_id, vec![side])?;

        // Add the new upload
        let new = NewDocumentUploadRow {
            document_id,
            side,
            s3_url,
            e_data_key,
            created_at: Utc::now(),
        };
        let result = diesel::insert_into(document_upload::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }

    pub fn deactivate(
        conn: &mut TxnPgConn,
        document_id: &IdentityDocumentId,
        sides: Vec<DocumentSide>,
    ) -> DbResult<()> {
        diesel::update(document_upload::table)
            .filter(document_upload::document_id.eq(document_id))
            .filter(document_upload::side.eq_any(sides))
            .set(document_upload::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;
        Ok(())
    }
}
