use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::document_upload;
use diesel::dsl::count_star;
use diesel::dsl::not;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::DataLifetimeSeqno;
use newtypes::IncodeFailureReason;
use newtypes::S3Url;
use newtypes::{DocumentSide, DocumentUploadId, IdentityDocumentId, SealedVaultDataKey};

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
    /// The seqno at which the image was uploaded to the vault
    pub created_seqno: Option<DataLifetimeSeqno>,
    /// When non-empty, the reasons why the image could not be verified
    pub failure_reasons: Option<Vec<IncodeFailureReason>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = document_upload)]
struct NewDocumentUploadRow {
    pub document_id: IdentityDocumentId,
    pub side: DocumentSide,
    pub s3_url: S3Url,
    pub e_data_key: SealedVaultDataKey,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub failure_reasons: Vec<IncodeFailureReason>,
}

impl DocumentUpload {
    /// Max number attempts to upload a given side before we fail the document request
    pub const MAX_ATTEMPTS_PER_SIDE: i64 = 5;

    #[tracing::instrument("DocumentUpload::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        document_id: IdentityDocumentId,
        side: DocumentSide,
        s3_url: S3Url,
        e_data_key: SealedVaultDataKey,
        created_seqno: DataLifetimeSeqno,
    ) -> DbResult<Self> {
        // Deactivate existing upload, if any
        // TODO this kind of silently replaces an old image, but maybe we don't want to allow this...
        // only allow re-uploading an image if the last image explicitly failed.
        Self::deactivate(conn, &document_id, vec![side], vec![])?;

        // Add the new upload
        let new = NewDocumentUploadRow {
            document_id,
            side,
            s3_url,
            e_data_key,
            created_at: Utc::now(),
            created_seqno,
            failure_reasons: vec![],
        };
        let result = diesel::insert_into(document_upload::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("DocumentUpload::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        document_id: &IdentityDocumentId,
        sides: Vec<DocumentSide>,
        failure_reasons: Vec<IncodeFailureReason>,
    ) -> DbResult<()> {
        diesel::update(document_upload::table)
            .filter(document_upload::document_id.eq(document_id))
            .filter(document_upload::side.eq_any(sides))
            .filter(document_upload::deactivated_at.is_null())
            .set((
                document_upload::deactivated_at.eq(Utc::now()),
                document_upload::failure_reasons.eq(failure_reasons),
            ))
            .execute(conn.conn())?;
        Ok(())
    }

    /// Count how many deactivated (= failed) attempts there were to upload each side of the
    /// provided document
    #[tracing::instrument("DocumentUpload::count_failed_attempts", skip_all)]
    pub fn count_failed_attempts(
        conn: &mut PgConn,
        document_id: &IdentityDocumentId,
    ) -> DbResult<Vec<(DocumentSide, i64)>> {
        let results = document_upload::table
            .filter(document_upload::document_id.eq(document_id))
            .filter(not(document_upload::deactivated_at.is_null()))
            .group_by(document_upload::side)
            .select((document_upload::side, count_star()))
            .get_results(conn)?;
        Ok(results)
    }
}
