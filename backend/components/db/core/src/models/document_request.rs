use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::document_request;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::IdDocKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::WorkflowId;
use newtypes::{DocumentRequestId, ScopedVaultId};

pub type DocRefId = String;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = document_request)]
pub struct DocumentRequest {
    pub id: DocumentRequestId,
    // Not really needed anymore since we can go through Workflow
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<DocRefId>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub should_collect_selfie: bool,
    pub workflow_id: WorkflowId,
    // Document types that are accepted across all countries, except if overridden in country_doc_type_restrictions
    // These drive the frontend UI and are generated in get_requirements. If this is None, we fall back to accepting any ModerIdDocKind
    pub global_doc_types_accepted: Option<Vec<IdDocKind>>,
    // if !empty, restrict to only these countries
    pub country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    // if key for a country is present, will include the subset of global_doc_types_accepted for a specific countrys
    pub country_doc_type_restrictions: Option<serde_json::Value>,
}

impl DocumentRequest {
    pub fn only_us(&self) -> bool {
        self.country_restrictions
            .as_ref()
            .map(|cr| cr.len() == 1 && cr.first() == Some(&Iso3166TwoDigitCountryCode::US))
            .unwrap_or(false)
    }
}

impl DocumentRequest {
    #[tracing::instrument("DocumentRequest::create", skip_all)]
    pub fn create(conn: &mut PgConn, args: NewDocumentRequestArgs) -> DbResult<Self> {
        let NewDocumentRequestArgs {
            scoped_vault_id,
            ref_id,
            workflow_id,
            should_collect_selfie,
            global_doc_types_accepted,
            country_restrictions,
            country_doc_type_restrictions,
        } = args;
        let new = NewDocumentRequestRow {
            scoped_vault_id,
            ref_id,
            created_at: Utc::now(),
            should_collect_selfie,
            workflow_id,
            global_doc_types_accepted,
            country_restrictions,
            country_doc_type_restrictions,
        };
        let result = diesel::insert_into(document_request::table)
            .values(new)
            .get_result::<DocumentRequest>(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::get", skip_all)]
    pub fn get(conn: &mut PgConn, wf_id: &WorkflowId) -> DbResult<Option<Self>> {
        let result = document_request::table
            .filter(document_request::workflow_id.eq(wf_id))
            .first(conn)
            .optional()?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::get_or_create", skip_all)]
    pub fn get_or_create(conn: &mut TxnPgConn, args: NewDocumentRequestArgs) -> DbResult<Self> {
        if let Some(existing) = Self::get(conn, &args.workflow_id)? {
            // TODO FP-5894: this is a bit lacking in specificity could be a doc req that is _not_ a selfie, but should be a selfie based on app logic
            Ok(existing)
        } else {
            Self::create(conn, args)
        }
    }
}

#[derive(Debug, Clone)]
pub struct NewDocumentRequestArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<String>,
    pub should_collect_selfie: bool,
    pub workflow_id: WorkflowId,
    pub global_doc_types_accepted: Option<Vec<IdDocKind>>,
    pub country_restrictions: Vec<Iso3166TwoDigitCountryCode>,
    pub country_doc_type_restrictions: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = document_request)]
struct NewDocumentRequestRow {
    scoped_vault_id: ScopedVaultId,
    ref_id: Option<String>,
    created_at: DateTime<Utc>,
    should_collect_selfie: bool,
    workflow_id: WorkflowId,
    global_doc_types_accepted: Option<Vec<IdDocKind>>,
    country_restrictions: Vec<Iso3166TwoDigitCountryCode>,
    country_doc_type_restrictions: Option<serde_json::Value>,
}
