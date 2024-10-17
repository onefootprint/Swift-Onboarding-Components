use crate::DbResult;
use crate::PgConn;
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
    pub fn create(conn: &mut PgConn, row: NewWorkflowRequestJunctionRow) -> DbResult<Self> {
        let result = diesel::insert_into(workflow_request_junction::table)
            .values(row)
            .get_result::<Self>(conn)?;
        Ok(result)
    }

    pub fn get(conn: &mut PgConn, wfr_id: &WorkflowRequestId, sv_id: &ScopedVaultId) -> DbResult<Self> {
        let result = workflow_request_junction::table
            .filter(workflow_request_junction::workflow_request_id.eq(wfr_id))
            .filter(workflow_request_junction::scoped_vault_id.eq(sv_id))
            .get_result::<Self>(conn)?;
        Ok(result)
    }
}
