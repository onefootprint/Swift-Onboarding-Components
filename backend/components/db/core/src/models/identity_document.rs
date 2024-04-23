use crate::{errors::ValidationError, DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{document_request, document_upload, identity_document, incode_verification_session};

use diesel::{
    dsl::{count_star, not},
    prelude::*,
    Insertable, Queryable,
};
use std::collections::HashMap;

use newtypes::{
    DataLifetimeSeqno, DocumentRequestId, DocumentReviewStatus, DocumentScanDeviceType, IdDocKind,
    IdentityDocumentFixtureResult, IdentityDocumentId, IdentityDocumentStatus,
    IncodeVerificationSessionState, Iso3166TwoDigitCountryCode, ScopedVaultId, TenantId,
    VendorValidatedCountryCode, WorkflowId,
};

use super::{
    document_request::DocumentRequest, document_upload::DocumentUpload,
    incode_verification_session::IncodeVerificationSession,
};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = identity_document)]
pub struct IdentityDocument {
    pub id: IdentityDocumentId,
    pub request_id: DocumentRequestId,
    /// This is the stated document type, selected by the user, not necessarily the true document type
    pub document_type: IdDocKind,
    pub country_code: Option<String>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    /// This may be set for failed or complete IdentityDocuments
    pub completed_seqno: Option<DataLifetimeSeqno>,
    // DO NOT CHANGE THE ORDER OF THESE FIELDS
    pub document_score: Option<f64>,
    pub selfie_score: Option<f64>,
    pub ocr_confidence_score: Option<f64>,
    /// Represents progress collecting the user's document
    pub status: IdentityDocumentStatus,
    pub fixture_result: Option<IdentityDocumentFixtureResult>,
    // Indicating that the client cannot collect selfie for some reason
    pub skip_selfie: Option<bool>,
    // the device type that was used to collect this document (currently provided by bifrost, in the future perhaps derived from Stytch)
    pub device_type: Option<DocumentScanDeviceType>,
    // the document_type we stored this in the vault as
    pub vaulted_document_type: Option<IdDocKind>,
    pub curp_completed_seqno: Option<DataLifetimeSeqno>,
    /// The confirmed document country (usually confirmed by a vendor)
    validated_country_code: Option<Iso3166TwoDigitCountryCode>,
    /// Represents whether the document has been reviewed by a human or machine
    pub review_status: Option<DocumentReviewStatus>,
}

impl IdentityDocument {
    pub fn should_skip_selfie(&self) -> bool {
        matches!(self.skip_selfie, Some(true))
    }

    pub fn collected_on_desktop(&self) -> bool {
        matches!(self.device_type, Some(DocumentScanDeviceType::Desktop))
    }

    pub fn is_upload_complete(&self) -> bool {
        matches!(self.status, IdentityDocumentStatus::Complete)
    }

    pub fn vendor_validated_country_code(&self) -> Option<VendorValidatedCountryCode> {
        self.validated_country_code.map(VendorValidatedCountryCode)
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = identity_document)]
pub struct NewIdentityDocumentArgs {
    pub request_id: DocumentRequestId,
    pub document_type: IdDocKind,
    pub country_code: Option<Iso3166TwoDigitCountryCode>,
    pub fixture_result: Option<IdentityDocumentFixtureResult>,
    pub skip_selfie: Option<bool>,
    pub device_type: Option<DocumentScanDeviceType>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = identity_document)]
struct NewIdentityDocumentRow {
    request_id: DocumentRequestId,
    document_type: IdDocKind,
    country_code: Option<Iso3166TwoDigitCountryCode>,
    created_at: DateTime<Utc>,
    status: IdentityDocumentStatus,
    fixture_result: Option<IdentityDocumentFixtureResult>,
    skip_selfie: bool,
    device_type: Option<DocumentScanDeviceType>,
    review_status: DocumentReviewStatus,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = identity_document)]
pub struct IdentityDocumentUpdate {
    pub completed_seqno: Option<DataLifetimeSeqno>,
    pub document_score: Option<f64>,
    pub selfie_score: Option<f64>,
    pub ocr_confidence_score: Option<f64>,
    pub status: Option<IdentityDocumentStatus>,
    pub vaulted_document_type: Option<IdDocKind>,
    pub curp_completed_seqno: Option<DataLifetimeSeqno>,
    pub validated_country_code: Option<Iso3166TwoDigitCountryCode>,
    pub review_status: Option<DocumentReviewStatus>,
}

impl IdentityDocumentUpdate {
    pub fn set_curp_completed_seqno(seqno: DataLifetimeSeqno) -> Self {
        Self {
            curp_completed_seqno: Some(seqno),
            ..Default::default()
        }
    }
}

impl IdentityDocument {
    #[tracing::instrument("IdentityDocument::get_or_create", skip_all)]
    /// Returns the existing IdentityDocument with this args if uploads haven't began. Otherwise
    /// creates a new IdentityDocument and deactivates the old ones
    pub fn get_or_create(conn: &mut TxnPgConn, args: NewIdentityDocumentArgs) -> DbResult<Self> {
        let dr = document_request::table
            .filter(document_request::id.eq(&args.request_id))
            .for_no_key_update()
            .get_result::<DocumentRequest>(conn.conn())?;
        let NewIdentityDocumentArgs {
            request_id,
            document_type,
            country_code,
            fixture_result,
            skip_selfie,
            device_type,
        } = args;

        if country_code.is_none() && dr.kind.is_identity() {
            return ValidationError("Country code must be provided for ID doc").into();
        }

        // See if we can use an existing Pending IdDoc instead of making a new on
        let existing: Option<Self> = identity_document::table
            .filter(identity_document::request_id.eq(&request_id))
            .filter(identity_document::status.eq(IdentityDocumentStatus::Pending))
            .get_result(conn.conn())
            .optional()?;
        if let Some(existing) = existing {
            let has_no_uploads = existing.images(conn, false)?.is_empty();
            if existing.document_type == document_type
                && existing.country_code == country_code.map(|c| c.to_string())
                && existing.fixture_result == fixture_result
                && existing.skip_selfie == skip_selfie
                && existing.device_type == device_type
                && has_no_uploads
            {
                return Ok(existing);
            }
        }

        // Otherwise, make a new IdDoc
        // Mark all existing IdentityDocuments for this DocumentRequest as failed
        diesel::update(identity_document::table)
            .filter(identity_document::request_id.eq(&request_id))
            .filter(identity_document::status.eq(IdentityDocumentStatus::Pending))
            .set(identity_document::status.eq(IdentityDocumentStatus::Failed))
            .execute(conn.conn())?;
        let new = NewIdentityDocumentRow {
            request_id,
            document_type,
            country_code,
            created_at: Utc::now(),
            status: IdentityDocumentStatus::Pending,
            fixture_result,
            skip_selfie: skip_selfie.unwrap_or(false),
            device_type,
            review_status: DocumentReviewStatus::Unreviewed,
        };
        // Create a new doc
        let result = diesel::insert_into(identity_document::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("IdentityDocument::update", skip_all)]
    pub fn update(
        conn: &mut PgConn,
        id: &IdentityDocumentId,
        update: IdentityDocumentUpdate,
    ) -> DbResult<Self> {
        let res = diesel::update(identity_document::table)
            .filter(identity_document::id.eq(id))
            .set(update)
            .get_result(conn)?;

        Ok(res)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("IdentityDocument::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &IdentityDocumentId) -> DbResult<(Self, DocumentRequest)> {
        let res = identity_document::table
            .filter(identity_document::id.eq(id))
            .inner_join(document_request::table)
            .select((identity_document::all_columns, document_request::all_columns))
            .get_result(conn)?;

        Ok(res)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("IdentityDocument::get_by_request_id", skip_all)]
    pub fn list_by_request_id(conn: &mut PgConn, request_id: &DocumentRequestId) -> DbResult<Vec<Self>> {
        let res = identity_document::table
            .filter(identity_document::request_id.eq(request_id))
            .get_results(conn)?;

        Ok(res)
    }

    #[tracing::instrument("IdentityDocument::get_bulk_with_requests", skip_all)]
    pub fn get_bulk_with_requests(
        conn: &mut PgConn,
        ids: Vec<&IdentityDocumentId>,
    ) -> DbResult<HashMap<IdentityDocumentId, (Self, DocumentRequest)>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(identity_document::id.eq_any(ids))
            .get_results::<(Self, DocumentRequest)>(conn)?
            .into_iter()
            .map(|e| (e.0.id.clone(), e))
            .collect();

        Ok(results)
    }

    /// Get all the documents collected for a given scoped vault over all workflows
    #[tracing::instrument("IdentityDocument::list", skip_all)]
    pub fn list(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .select(identity_document::all_columns)
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument("IdentityDocument::list_by_wf_id", skip_all)]
    pub fn list_by_wf_id(conn: &mut PgConn, wf_id: &WorkflowId) -> DbResult<Vec<(Self, DocumentRequest)>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(document_request::workflow_id.eq(wf_id))
            .select((identity_document::all_columns, document_request::all_columns))
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument("IdentityDocument::list_sent_to_incode_by_wf_id", skip_all)]
    pub fn list_completed_sent_to_incode_by_wf_id(
        conn: &mut PgConn,
        wf_id: &WorkflowId,
    ) -> DbResult<Vec<(Self, DocumentRequest, Option<IncodeVerificationSession>)>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(document_request::workflow_id.eq(wf_id))
            // only completed
            .filter(not(identity_document::completed_seqno.is_null()))
            // join in docs that went to incode
            .left_join(incode_verification_session::table.on(incode_verification_session::identity_document_id.eq(identity_document::id)))
            // latest is first
            .order_by(identity_document::completed_seqno.desc())
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument("IdentityDocument::get_latest_complete", skip_all)]
    pub fn get_latest_complete(
        conn: &mut PgConn,
        sv_id: ScopedVaultId,
    ) -> DbResult<Option<(IdentityDocument, DocumentRequest)>> {
        let res = identity_document::table
            .inner_join(document_request::table)
            .filter(identity_document::status.eq(IdentityDocumentStatus::Complete))
            .filter(document_request::scoped_vault_id.eq(sv_id))
            .order_by(identity_document::completed_seqno.desc())
            .first(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument("IdentityDocument::images", skip_all)]
    pub fn images(&self, conn: &mut PgConn, only_active: bool) -> DbResult<Vec<DocumentUpload>> {
        let mut query = document_upload::table
            .filter(document_upload::document_id.eq(&self.id))
            .into_boxed();
        if only_active {
            query = query.filter(document_upload::deactivated_at.is_null())
        }
        let results = query.get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("IdentityDocument::get_billable_count", skip_all)]
    pub fn get_billable_count(
        conn: &mut PgConn,
        t_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> DbResult<i64> {
        use db_schema::schema::{incode_verification_session, scoped_vault};
        let count = identity_document::table
            .inner_join(document_request::table.inner_join(scoped_vault::table))
            // This will have the effect of not charging for SSN cards since we don't verify them
            // with incode
            .inner_join(incode_verification_session::table)
            // Basic filters
            .filter(scoped_vault::is_live.eq(true))
            .filter(scoped_vault::tenant_id.eq(t_id))
            // Include deactivated scoped vaults.
            // Only completed docs
            .filter(incode_verification_session::state.eq(IncodeVerificationSessionState::Complete))
            // Filter for id docs that happened during this time
            .filter(incode_verification_session::completed_at.ge(start_date))
            .filter(incode_verification_session::completed_at.lt(end_date))
            .select(count_star())
            .get_result(conn)?;
        Ok(count)
    }
}
