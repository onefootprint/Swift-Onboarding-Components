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
    /// Client-provided (so cannot always be trusted) flag that tells if the upload was captured
    /// via Android instant app
    pub is_instant_app: Option<bool>,
    /// Client-provided (so cannot always be trusted) flag that tells if the upload was captured
    /// via Apple app clip
    pub is_app_clip: Option<bool>,
    /// Client-provided (so cannot always be trusted) flag that tells if the upload was captured
    /// manually
    pub is_manual: Option<bool>,
    /// Client-provided (so cannot always be trusted) flag that tells if the upload was compressed
    /// more than normal. We do this when we detect the user has a poor internet connection.
    /// The results for this upload may be worse
    pub is_extra_compressed: bool,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = document_upload)]
struct NewDocumentUploadRow {
    document_id: IdentityDocumentId,
    side: DocumentSide,
    s3_url: S3Url,
    e_data_key: SealedVaultDataKey,
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    failure_reasons: Vec<IncodeFailureReason>,
    is_instant_app: Option<bool>,
    is_app_clip: Option<bool>,
    is_manual: Option<bool>,
    is_extra_compressed: bool,
}

#[derive(Debug, AsChangeset)]
#[diesel(table_name = document_upload)]
pub struct IdentityDocumentUpdate {
    pub deactivated_at: Option<DateTime<Utc>>,
    pub failure_reasons: Option<Vec<IncodeFailureReason>>,
}

#[derive(Debug)]
pub struct NewDocumentUploadArgs {
    pub document_id: IdentityDocumentId,
    pub side: DocumentSide,
    pub s3_url: S3Url,
    pub e_data_key: SealedVaultDataKey,
    pub created_seqno: DataLifetimeSeqno,
    pub is_instant_app: Option<bool>,
    pub is_app_clip: Option<bool>,
    pub is_manual: Option<bool>,
    pub is_extra_compressed: bool,
}

impl DocumentUpload {
    /// Max number attempts to upload a given side before we fail the document request
    pub const MAX_ATTEMPTS_PER_SIDE: i64 = 3;
    pub const MAX_ATTEMPTS_BEFORE_DROPPING_GLARE_CHECK: i64 = 2;

    #[tracing::instrument("DocumentUpload::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewDocumentUploadArgs) -> DbResult<Self> {
        let NewDocumentUploadArgs {
            document_id,
            side,
            s3_url,
            e_data_key,
            created_seqno,
            is_instant_app,
            is_app_clip,
            is_manual,
            is_extra_compressed,
        } = args;
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
            is_instant_app,
            is_app_clip,
            is_manual,
            is_extra_compressed,
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

impl DocumentUpload {
    // can't be in test binary since it won't be accessible cross-crate
    pub fn get_for_side_in_tests(
        conn: &mut PgConn,
        document_id: &IdentityDocumentId,
        side: DocumentSide,
    ) -> DbResult<Self> {
        let res = document_upload::table
            .filter(document_upload::document_id.eq(document_id))
            .filter(document_upload::side.eq(side))
            .filter(document_upload::deactivated_at.is_null())
            .get_result(conn)?;

        Ok(res)
    }
}
