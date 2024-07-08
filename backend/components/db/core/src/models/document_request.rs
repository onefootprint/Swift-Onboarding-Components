use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::document_request::{
    self,
};
use db_schema::schema::identity_document;
use db_schema::schema::scoped_vault;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::DocumentId;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentRequestId;
use newtypes::DocumentRequestKind;
use newtypes::RuleSetResultId;
use newtypes::ScopedVaultId;
use newtypes::VaultKind;
use newtypes::WorkflowId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = document_request)]
pub struct DocumentRequest {
    pub id: DocumentRequestId,
    // Not really needed anymore since we can go through Workflow
    pub scoped_vault_id: ScopedVaultId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub workflow_id: WorkflowId,
    pub kind: DocumentRequestKind,
    // If docreq was created as a result of a stepup rule, then this would be the id of that rule_result
    // Note: Not currently backfilled for all historical docreqs!
    pub rule_set_result_id: Option<RuleSetResultId>,
    pub config: DocumentRequestConfig,
}

#[derive(derive_more::From)]
pub enum DocumentRequestIdentifier<'a> {
    Id(&'a DocumentRequestId),
    Kind(DocumentRequestKind),
}

impl DocumentRequest {
    #[tracing::instrument("DocumentRequest::create", skip_all)]
    pub fn create(conn: &mut PgConn, args: NewDocumentRequestArgs) -> DbResult<Self> {
        let NewDocumentRequestArgs {
            scoped_vault_id,
            workflow_id,
            rule_set_result_id,
            config,
        } = args;
        let kind = (&config).into();
        let new = NewDocumentRequestRow {
            scoped_vault_id,
            created_at: Utc::now(),
            workflow_id,
            kind,
            rule_set_result_id,
            config,
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
                    workflow_id,
                    config,
                    rule_set_result_id,
                } = a;
                let kind = (&config).into();
                NewDocumentRequestRow {
                    scoped_vault_id,
                    created_at: Utc::now(),
                    workflow_id,
                    kind,
                    rule_set_result_id,
                    config,
                }
            })
            .collect();
        let result = diesel::insert_into(document_request::table)
            .values(new_rows)
            .get_results::<DocumentRequest>(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DocumentRequest::get", skip_all)]
    pub fn get<'a, T: Into<DocumentRequestIdentifier<'a>>>(
        conn: &mut PgConn,
        wf_id: &WorkflowId,
        id: T,
    ) -> DbResult<Option<Self>> {
        let mut query = document_request::table
            .filter(document_request::workflow_id.eq(wf_id))
            .into_boxed();
        match id.into() {
            DocumentRequestIdentifier::Id(id) => {
                query = query.filter(document_request::id.eq(id));
            }
            DocumentRequestIdentifier::Kind(kind) => {
                query = query.filter(document_request::kind.eq(kind));
            }
        }
        let result = query.first(conn).optional()?;
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
        let kind = DocumentRequestKind::from(&args.config);
        if let Some(existing) = Self::get(conn, &args.workflow_id, kind)? {
            // TODO FP-5894: this is a bit lacking in specificity could be a doc req that is _not_ a selfie,
            // but should be a selfie based on app logic
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

    #[tracing::instrument("DocumentRequest::get_owner_kind", skip_all)]
    /// Very targeted method to just return the kind of the vault that owns this document request.
    /// Since we haven't checked ownership of the document request at this point, we don't want to
    /// return any info from the document request itself.
    pub fn get_owner_kind(conn: &mut PgConn, id: UncheckedDrIdentifier) -> DbResult<VaultKind> {
        let mut sv_query = document_request::table
            .select(document_request::scoped_vault_id)
            .into_boxed();
        match id {
            UncheckedDrIdentifier::Id(dr_id) => sv_query = sv_query.filter(document_request::id.eq(dr_id)),
            UncheckedDrIdentifier::DocumentId(d_id) => {
                let dr_id = identity_document::table
                    .filter(identity_document::id.eq(d_id))
                    .select(identity_document::request_id);
                sv_query = sv_query.filter(document_request::id.eq_any(dr_id))
            }
        };
        let result = scoped_vault::table
            .filter(scoped_vault::id.eq_any(sv_query))
            .select(scoped_vault::kind)
            .get_result::<VaultKind>(conn)?;
        Ok(result)
    }
}

#[derive(derive_more::From)]
pub enum UncheckedDrIdentifier {
    Id(DocumentRequestId),
    DocumentId(DocumentId),
}

impl DocumentRequest {
    pub fn should_collect_selfie(&self) -> bool {
        match &self.config {
            DocumentRequestConfig::Identity { collect_selfie } => *collect_selfie,
            _ => false,
        }
    }
}

#[derive(Debug, Clone)]
pub struct NewDocumentRequestArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: WorkflowId,
    pub rule_set_result_id: Option<RuleSetResultId>,
    pub config: DocumentRequestConfig,
}

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = document_request)]
struct NewDocumentRequestRow {
    scoped_vault_id: ScopedVaultId,
    created_at: DateTime<Utc>,
    workflow_id: WorkflowId,
    kind: DocumentRequestKind,
    rule_set_result_id: Option<RuleSetResultId>,
    config: DocumentRequestConfig,
}
