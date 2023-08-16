use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::document_request;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::ModernIdDocKind;
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
    pub only_us: bool,
    // Document types that are accepted across all countries, except if overridden in country_doc_type_restrictions
    pub global_doc_types_accepted: Option<Vec<ModernIdDocKind>>,
    // if !empty, restrict to only these countries
    pub country_restrictions: Option<Vec<String>>,
    // if key for a country is present, will include the subset of global_doc_types_accepted for a specific countrys
    pub country_doc_type_restrictions: Option<serde_json::Value>,
}

impl DocumentRequest {
    pub fn only_us(&self) -> bool {
        self.country_restrictions
            .as_ref()
            .map(|cr| cr.len() == 1 && cr.first() == Some(&"US".to_string()))
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
            only_us,
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
            only_us,
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
}

#[derive(Debug, Clone)]
pub struct NewDocumentRequestArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<String>,
    pub should_collect_selfie: bool,
    pub workflow_id: WorkflowId,
    pub only_us: bool,
    pub global_doc_types_accepted: Option<Vec<ModernIdDocKind>>,
    // TODO: enum
    pub country_restrictions: Vec<String>,
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
    only_us: bool,
    global_doc_types_accepted: Option<Vec<ModernIdDocKind>>,
    // TODO: enum
    country_restrictions: Vec<String>,
    country_doc_type_restrictions: Option<serde_json::Value>,
}
