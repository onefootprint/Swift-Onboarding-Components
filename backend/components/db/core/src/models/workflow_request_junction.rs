use super::workflow::Workflow;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::workflow;
use db_schema::schema::workflow_request_junction;
use diesel::prelude::*;
use newtypes::ScopedVaultId;
use newtypes::VaultKind;
use newtypes::WorkflowId;
use newtypes::WorkflowRequestId;
use newtypes::WorkflowRequestJunctionId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = workflow_request_junction)]
/// Junction table between a WorkflowRequest and a scoped vault created at the time the
/// WorkflowRequest is made. The `workflow_id` is populated at the time a corresponding Workflow is
/// created.
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
    pub fn bulk_create(conn: &mut PgConn, rows: Vec<NewWorkflowRequestJunctionRow>) -> FpResult<Vec<Self>> {
        let result = diesel::insert_into(workflow_request_junction::table)
            .values(rows)
            .get_results::<Self>(conn)?;
        Ok(result)
    }

    #[tracing::instrument("WorkflowRequestJunction::set_wf_id", skip_all)]
    pub fn set_wf_id(conn: &mut TxnPgConn, id: &WorkflowRequestId, wf: &Workflow) -> FpResult<Vec<Self>> {
        let results = diesel::update(workflow_request_junction::table)
            .filter(workflow_request_junction::workflow_request_id.eq(id))
            .filter(workflow_request_junction::scoped_vault_id.eq(&wf.scoped_vault_id))
            .filter(workflow_request_junction::workflow_id.is_null())
            .set(workflow_request_junction::workflow_id.eq(&wf.id))
            .get_results::<WorkflowRequestJunction>(conn.conn())?;
        Ok(results)
    }

    #[tracing::instrument("WorkflowRequestJunction::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        wfr_id: &WorkflowRequestId,
        sv_id: &ScopedVaultId,
    ) -> FpResult<(Self, Option<Workflow>)> {
        let result = workflow_request_junction::table
            .left_join(workflow::table)
            .filter(workflow_request_junction::workflow_request_id.eq(wfr_id))
            .filter(workflow_request_junction::scoped_vault_id.eq(sv_id))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("WorkflowRequestJunction::list", skip_all)]
    pub fn list(conn: &mut PgConn, wfr_id: &WorkflowRequestId) -> FpResult<Vec<Self>> {
        let results = workflow_request_junction::table
            .filter(workflow_request_junction::workflow_request_id.eq(wfr_id))
            .get_results::<Self>(conn)?;
        Ok(results)
    }
}
