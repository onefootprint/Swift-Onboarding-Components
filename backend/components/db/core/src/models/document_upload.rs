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
    pub created_seqno: DataLifetimeSeqno,
    /// When non-empty, the reasons why the image could not be verified
    pub failure_reasons: Vec<IncodeFailureReason>,
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

#[derive(Debug, AsChangeset)]
#[diesel(table_name = document_upload)]
pub struct IdentityDocumentUpdate {
    pub deactivated_at: Option<DateTime<Utc>>,
    pub failure_reasons: Option<Vec<IncodeFailureReason>>,
}

impl DocumentUpload {
    /// Max number attempts to upload a given side before we fail the document request
    pub const MAX_ATTEMPTS_PER_SIDE: i64 = 3;
    pub const MAX_ATTEMPTS_BEFORE_DROPPING_GLARE_CHECK: i64 = 2;

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
        Self::set_failure_reasons(conn, &document_id, side, vec![], true)?;

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

    #[tracing::instrument("DocumentUpload::set_failure_reasons", skip_all)]
    pub fn set_failure_reasons(
        conn: &mut TxnPgConn,
        document_id: &IdentityDocumentId,
        side: DocumentSide,
        failure_reasons: Vec<IncodeFailureReason>,
        deactivate: bool,
    ) -> DbResult<()> {
        let update = IdentityDocumentUpdate {
            deactivated_at: deactivate.then_some(Utc::now()),
            failure_reasons: Some(failure_reasons),
        };
        diesel::update(document_upload::table)
            .filter(document_upload::document_id.eq(document_id))
            .filter(document_upload::side.eq(side))
            .filter(document_upload::deactivated_at.is_null())
            .set(update)
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
