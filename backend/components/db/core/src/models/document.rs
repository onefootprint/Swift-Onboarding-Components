use super::document_request::DocumentRequest;
use super::document_upload::DocumentUpload;
use super::incode_verification_session::IncodeVerificationSession;
use super::insight_event::CreateInsightEvent;
use crate::errors::ValidationError;
use crate::{
    DbResult,
    PgConn,
    TxnPgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::{
    document_request,
    document_upload,
    identity_document,
    incode_verification_session,
};
use diesel::dsl::{
    count_star,
    not,
};
use diesel::prelude::*;
use diesel::{
    Insertable,
    Queryable,
};
use newtypes::{
    CustomDocumentConfig,
    DataIdentifier,
    DataLifetimeSeqno,
    DeviceType,
    DocumentDiKind,
    DocumentFixtureResult,
    DocumentId,
    DocumentKind,
    DocumentRequestConfig,
    DocumentRequestId,
    DocumentReviewStatus,
    DocumentSide,
    DocumentStatus,
    IdDocKind,
    IncodeVerificationSessionState,
    InsightEventId,
    Iso3166TwoDigitCountryCode,
    ScopedVaultId,
    TenantId,
    VendorValidatedCountryCode,
    WorkflowId,
};
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = identity_document)]
pub struct Document {
    pub id: DocumentId,
    pub request_id: DocumentRequestId,
    /// This is the stated document type, selected by the user, not necessarily the true document
    /// type
    pub document_type: DocumentKind,
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
    pub status: DocumentStatus,
    pub fixture_result: Option<DocumentFixtureResult>,
    // Indicating that the client cannot collect selfie for some reason
    pub skip_selfie: Option<bool>,
    // the device type that was used to collect this document (currently provided by bifrost, in the future
    // perhaps derived from Stytch)
    pub device_type: Option<DeviceType>,
    // the document_type we stored this in the vault as
    pub vaulted_document_type: Option<DocumentKind>,
    pub curp_completed_seqno: Option<DataLifetimeSeqno>,
    /// The confirmed document country (usually confirmed by a vendor)
    validated_country_code: Option<Iso3166TwoDigitCountryCode>,
    /// Represents whether the document has been reviewed by a human or machine
    pub review_status: DocumentReviewStatus,
    pub insight_event_id: Option<InsightEventId>,
}

impl Document {
    pub fn should_skip_selfie(&self) -> bool {
        matches!(self.skip_selfie, Some(true))
    }

    pub fn collected_on_desktop(&self) -> bool {
        matches!(self.device_type, Some(DeviceType::Desktop))
    }

    pub fn is_upload_complete(&self) -> bool {
        matches!(self.status, DocumentStatus::Complete)
    }

    pub fn vendor_validated_country_code(&self) -> Option<VendorValidatedCountryCode> {
        self.validated_country_code.map(VendorValidatedCountryCode)
    }
}

#[derive(Debug, Clone)]
pub struct NewDocumentArgs {
    pub request_id: DocumentRequestId,
    pub document_type: DocumentKind,
    pub country_code: Option<Iso3166TwoDigitCountryCode>,
    pub fixture_result: Option<DocumentFixtureResult>,
    pub skip_selfie: Option<bool>,
    pub device_type: Option<DeviceType>,
    pub insight: CreateInsightEvent,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = identity_document)]
struct NewDocumentRow {
    request_id: DocumentRequestId,
    document_type: DocumentKind,
    country_code: Option<Iso3166TwoDigitCountryCode>,
    created_at: DateTime<Utc>,
    status: DocumentStatus,
    fixture_result: Option<DocumentFixtureResult>,
    skip_selfie: bool,
    device_type: Option<DeviceType>,
    review_status: DocumentReviewStatus,
    insight_event_id: Option<InsightEventId>,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = identity_document)]
pub struct DocumentUpdate {
    pub completed_seqno: Option<DataLifetimeSeqno>,
    pub document_score: Option<f64>,
    pub selfie_score: Option<f64>,
    pub ocr_confidence_score: Option<f64>,
    pub status: Option<DocumentStatus>,
    pub vaulted_document_type: Option<DocumentKind>,
    pub curp_completed_seqno: Option<DataLifetimeSeqno>,
    pub validated_country_code: Option<Iso3166TwoDigitCountryCode>,
    pub review_status: Option<DocumentReviewStatus>,
}

impl DocumentUpdate {
    pub fn set_curp_completed_seqno(seqno: DataLifetimeSeqno) -> Self {
        Self {
            curp_completed_seqno: Some(seqno),
            ..Default::default()
        }
    }
}

impl Document {
    #[tracing::instrument("Document::get_or_create", skip_all)]
    /// Returns the existing Document with this args if uploads haven't began. Otherwise
    /// creates a new Document and deactivates the old ones
    pub fn get_or_create(conn: &mut TxnPgConn, args: NewDocumentArgs) -> DbResult<Self> {
        let dr = document_request::table
            .filter(document_request::id.eq(&args.request_id))
            .for_no_key_update()
            .get_result::<DocumentRequest>(conn.conn())?;
        let NewDocumentArgs {
            request_id,
            document_type,
            country_code,
            fixture_result,
            skip_selfie,
            device_type,
            insight,
        } = args;

        if country_code.is_none() && dr.kind.is_identity() {
            return ValidationError("Country code must be provided for ID doc").into();
        }

        // See if we can use an existing Pending IdDoc instead of making a new one
        let existing: Option<Self> = identity_document::table
            .filter(identity_document::request_id.eq(&request_id))
            .filter(identity_document::status.eq(DocumentStatus::Pending))
            .get_result(conn.conn())
            .optional()?;
        if let Some(existing) = existing {
            let args = DocumentImageArgs {
                only_active: false,
                ..DocumentImageArgs::default()
            };
            let has_no_uploads = existing.images(conn, args)?.is_empty();
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

        let insight_event_id = Some(insight.insert_with_conn(conn)?.id);

        // Otherwise, make a new IdDoc
        // Mark all existing IdentityDocuments for this DocumentRequest as failed
        diesel::update(identity_document::table)
            .filter(identity_document::request_id.eq(&request_id))
            // TODO it might be nice to use the deactivated_at model here too
            .filter(identity_document::status.eq(DocumentStatus::Pending))
            .set(identity_document::status.eq(DocumentStatus::Failed))
            .execute(conn.conn())?;
        let new = NewDocumentRow {
            request_id,
            document_type,
            country_code,
            created_at: Utc::now(),
            status: DocumentStatus::Pending,
            fixture_result,
            skip_selfie: skip_selfie.unwrap_or(false),
            device_type,
            review_status: DocumentReviewStatus::Unreviewed,
            insight_event_id,
        };
        // Create a new doc
        let result = diesel::insert_into(identity_document::table)
            .values(new)
            .get_result(conn.conn())?;

        Ok(result)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("Document::update", skip(conn, update))]
    pub fn update(conn: &mut PgConn, id: &DocumentId, update: DocumentUpdate) -> DbResult<Self> {
        let res = diesel::update(identity_document::table)
            .filter(identity_document::id.eq(id))
            .set(update)
            .get_result(conn)?;

        Ok(res)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("Document::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &DocumentId) -> DbResult<(Self, DocumentRequest)> {
        let res = identity_document::table
            .filter(identity_document::id.eq(id))
            .inner_join(document_request::table)
            .select((identity_document::all_columns, document_request::all_columns))
            .get_result(conn)?;

        Ok(res)
    }

    /// Get the identity document, and the associated document request
    #[tracing::instrument("Document::get_by_request_id", skip_all)]
    pub fn list_by_request_id(conn: &mut PgConn, request_id: &DocumentRequestId) -> DbResult<Vec<Self>> {
        let res = identity_document::table
            .filter(identity_document::request_id.eq(request_id))
            .get_results(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Document::get_bulk_with_requests", skip_all)]
    pub fn get_bulk_with_requests(
        conn: &mut PgConn,
        ids: Vec<&DocumentId>,
    ) -> DbResult<HashMap<DocumentId, (Self, DocumentRequest)>> {
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
    #[tracing::instrument("Document::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> DbResult<Vec<(Self, DocumentRequest)>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(document_request::scoped_vault_id.eq(scoped_vault_id))
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument("Document::list_by_wf_id", skip_all)]
    pub fn list_by_wf_id(conn: &mut PgConn, wf_id: &WorkflowId) -> DbResult<Vec<(Self, DocumentRequest)>> {
        let results = identity_document::table
            .inner_join(document_request::table)
            .filter(document_request::workflow_id.eq(wf_id))
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument("Document::list_completed_sent_to_incode", skip_all)]
    pub fn list_completed_sent_to_incode(
        conn: &mut PgConn,
        wf_id: Option<&WorkflowId>,
    ) -> DbResult<Vec<(Self, DocumentRequest, Option<IncodeVerificationSession>)>> {
        let mut query = identity_document::table
            .inner_join(document_request::table)
            // only completed
            .filter(not(identity_document::completed_seqno.is_null()))
            // join in docs that went to incode
            .left_join(incode_verification_session::table.on(incode_verification_session::identity_document_id.eq(identity_document::id)))
            .into_boxed();

        if let Some(wfid) = wf_id {
            query = query.filter(document_request::workflow_id.eq(wfid));
        }
        // latest is first
        let results = query
            .order_by(identity_document::completed_seqno.desc())
            .get_results(conn)?;

        Ok(results)
    }

    #[tracing::instrument("Document::get_latest_complete", skip_all)]
    pub fn get_latest_complete(
        conn: &mut PgConn,
        sv_id: ScopedVaultId,
    ) -> DbResult<Option<(Document, DocumentRequest)>> {
        let res = identity_document::table
            .inner_join(document_request::table)
            .filter(identity_document::status.eq(DocumentStatus::Complete))
            .filter(document_request::scoped_vault_id.eq(sv_id))
            .order_by(identity_document::completed_seqno.desc())
            .first(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument("Document::get_billable_count", skip_all)]
    pub fn get_billable_count(
        conn: &mut PgConn,
        t_id: &TenantId,
        start_date: DateTime<Utc>,
        end_date: DateTime<Utc>,
    ) -> DbResult<i64> {
        use db_schema::schema::{
            incode_verification_session,
            scoped_vault,
        };
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

    /// Logic to extract the DI for a given Document row. It can be derived from GovtIssuedDocKinds,
    /// but must be fetched from the DocumentRequestConfig for custom docs
    pub fn identifier(&self, config: &DocumentRequestConfig, side: DocumentSide) -> DbResult<DataIdentifier> {
        let di = match self.document_type {
            DocumentKind::IdCard
            | DocumentKind::DriversLicense
            | DocumentKind::Passport
            | DocumentKind::PassportCard
            | DocumentKind::Permit
            | DocumentKind::Visa
            | DocumentKind::ResidenceDocument
            | DocumentKind::VoterIdentification => {
                let id_doc_kind = IdDocKind::try_from(self.document_type)?;
                DataIdentifier::from(DocumentDiKind::LatestUpload(id_doc_kind, side))
            }
            DocumentKind::SsnCard => DataIdentifier::from(DocumentDiKind::SsnCard),
            DocumentKind::ProofOfAddress => DataIdentifier::from(DocumentDiKind::ProofOfAddress),
            DocumentKind::Custom => {
                let DocumentRequestConfig::Custom(CustomDocumentConfig { identifier, .. }) = config else {
                    return ValidationError("Custom document doesn't have identifier").into();
                };
                identifier.clone()
            }
        };
        Ok(di)
    }
}

pub struct DocumentImageArgs {
    pub only_active: bool,
    pub at_seqno: Option<DataLifetimeSeqno>,
}

impl Default for DocumentImageArgs {
    fn default() -> Self {
        Self {
            only_active: true,
            at_seqno: None,
        }
    }
}

impl Document {
    #[tracing::instrument("Document::images", skip_all)]
    pub fn images(&self, conn: &mut PgConn, args: DocumentImageArgs) -> DbResult<Vec<DocumentUpload>> {
        let mut query = document_upload::table
            .filter(document_upload::document_id.eq(&self.id))
            .into_boxed();
        if let Some(seqno) = args.at_seqno {
            query = query.filter(document_upload::created_seqno.le(seqno));
        }
        if args.only_active {
            query = query.filter(document_upload::deactivated_at.is_null());
        }
        let results = query.get_results(conn)?;
        Ok(results)
    }
}
