use super::workflow::Workflow;
use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::workflow_request_junction;
use diesel::prelude::*;
use newtypes::ScopedVaultId;
use newtypes::VaultKind;
use newtypes::WorkflowId;
use newtypes::WorkflowRequestId;
use newtypes::WorkflowRequestJunctionId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = workflow_request_junction)]
pub struct WorkflowRequestJunction {
    pub id: WorkflowRequestJunctionId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub kind: VaultKind,
    pub workflow_request_id: WorkflowRequestId,
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: Option<WorkflowId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = workflow_request_junction)]
pub struct NewWorkflowRequestJunctionRow<'a> {
    pub scoped_vault_id: &'a ScopedVaultId,
    pub workflow_request_id: &'a WorkflowRequestId,
    pub kind: VaultKind,
}

impl WorkflowRequestJunction {
    pub fn bulk_create(conn: &mut PgConn, rows: Vec<NewWorkflowRequestJunctionRow>) -> DbResult<Vec<Self>> {
        let result = diesel::insert_into(workflow_request_junction::table)
            .values(rows)
            .get_results::<Self>(conn)?;
        Ok(result)
    }

    #[tracing::instrument("WorkflowRequestJunction::set_wf_id", skip_all)]
    pub fn set_wf_id(conn: &mut TxnPgConn, id: &WorkflowRequestId, wf: &Workflow) -> DbResult<Vec<Self>> {
        let results = diesel::update(workflow_request_junction::table)
            .filter(workflow_request_junction::workflow_request_id.eq(id))
            .filter(workflow_request_junction::scoped_vault_id.eq(&wf.scoped_vault_id))
            .filter(workflow_request_junction::workflow_id.is_null())
            .set(workflow_request_junction::workflow_id.eq(&wf.id))
            .get_results::<WorkflowRequestJunction>(conn.conn())?;
        Ok(results)
    }

    pub fn get(conn: &mut PgConn, wfr_id: &WorkflowRequestId, sv_id: &ScopedVaultId) -> DbResult<Self> {
        let result = workflow_request_junction::table
            .filter(workflow_request_junction::workflow_request_id.eq(wfr_id))
            .filter(workflow_request_junction::scoped_vault_id.eq(sv_id))
            .get_result::<Self>(conn)?;
        Ok(result)
    }

    pub fn list(conn: &mut PgConn, wfr_id: &WorkflowRequestId) -> DbResult<Vec<Self>> {
        let results = workflow_request_junction::table
            .filter(workflow_request_junction::workflow_request_id.eq(wfr_id))
            .get_results::<Self>(conn)?;
        Ok(results)
    }
}
