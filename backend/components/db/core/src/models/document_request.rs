use std::collections::HashMap;

use crate::{DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::document_request;
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{
    DocumentRequestConfig, DocumentRequestId, DocumentRequestKind, RuleSetResultId, ScopedVaultId, WorkflowId,
};

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
    pub kind: DocumentRequestKind,
    // If docreq was created as a result of a stepup rule, then this would be the id of that rule_result
    // Note: Not currently backfilled for all historical docreqs!
    pub rule_set_result_id: Option<RuleSetResultId>,
    pub config: Option<DocumentRequestConfig>,
}

impl DocumentRequest {
    #[tracing::instrument("DocumentRequest::create", skip_all)]
    pub fn create(conn: &mut PgConn, args: NewDocumentRequestArgs) -> DbResult<Self> {
        let NewDocumentRequestArgs {
            scoped_vault_id,
            ref_id,
            workflow_id,
            should_collect_selfie,
            kind,
            rule_set_result_id,
        } = args;
        let new = NewDocumentRequestRow {
            scoped_vault_id,
            ref_id,
            created_at: Utc::now(),
            should_collect_selfie,
            workflow_id,
            kind,
            rule_set_result_id,
        };
        let result = diesel::insert_into(document_request::table)
            .values(new)
            .get_result::<DocumentRequest>(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::create", skip_all)]
    pub fn bulk_create(conn: &mut PgConn, args: Vec<NewDocumentRequestArgs>) -> DbResult<Vec<Self>> {
        let new_rows: Vec<NewDocumentRequestRow> = args
            .into_iter()
            .map(|a| {
                let NewDocumentRequestArgs {
                    scoped_vault_id,
                    ref_id,
                    workflow_id,
                    should_collect_selfie,
                    kind,
                    rule_set_result_id,
                } = a;
                NewDocumentRequestRow {
                    scoped_vault_id,
                    ref_id,
                    created_at: Utc::now(),
                    should_collect_selfie,
                    workflow_id,
                    kind,
                    rule_set_result_id,
                }
            })
            .collect();
        let result = diesel::insert_into(document_request::table)
            .values(new_rows)
            .get_results::<DocumentRequest>(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::get", skip_all)]
    pub fn get(conn: &mut PgConn, wf_id: &WorkflowId, kind: DocumentRequestKind) -> DbResult<Option<Self>> {
        let result = document_request::table
            .filter(document_request::workflow_id.eq(wf_id))
            .filter(document_request::kind.eq(kind))
            .first(conn)
            .optional()?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::get_all", skip_all)]
    pub fn get_all(conn: &mut PgConn, wf_id: &WorkflowId) -> DbResult<Vec<Self>> {
        let result = document_request::table
            .filter(document_request::workflow_id.eq(wf_id))
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::get_or_create", skip_all)]
    pub fn get_or_create(conn: &mut TxnPgConn, args: NewDocumentRequestArgs) -> DbResult<Self> {
        if let Some(existing) = Self::get(conn, &args.workflow_id, args.kind)? {
            // TODO FP-5894: this is a bit lacking in specificity could be a doc req that is _not_ a selfie, but should be a selfie based on app logic
            Ok(existing)
        } else {
            Self::create(conn, args)
        }
    }

    #[tracing::instrument("DocumentRequest::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<DocumentRequestId>,
    ) -> DbResult<HashMap<DocumentRequestId, DocumentRequest>> {
        let results = document_request::table
            .filter(document_request::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|l| (l.id.clone(), l))
            .collect();
        Ok(results)
    }
}


#[derive(Debug, Clone)]
pub struct NewDocumentRequestArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ref_id: Option<String>,
    pub should_collect_selfie: bool,
    pub workflow_id: WorkflowId,
    pub kind: DocumentRequestKind,
    pub rule_set_result_id: Option<RuleSetResultId>,
}

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = document_request)]
struct NewDocumentRequestRow {
    scoped_vault_id: ScopedVaultId,
    ref_id: Option<String>,
    created_at: DateTime<Utc>,
    should_collect_selfie: bool,
    workflow_id: WorkflowId,
    kind: DocumentRequestKind,
    rule_set_result_id: Option<RuleSetResultId>,
}
