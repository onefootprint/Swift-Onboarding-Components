use crate::DbResult;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::workflow_request;
use diesel::prelude::*;
use newtypes::DbActor;
use newtypes::ObConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::WorkflowId;
use newtypes::WorkflowRequestId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = workflow_request)]
pub struct WorkflowRequest {
    pub id: WorkflowRequestId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub timestamp: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_by_workflow_id: Option<WorkflowId>,
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub created_by: DbActor,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = workflow_request)]
struct NewWorkflowRequestRow {
    ob_configuration_id: ObConfigurationId,
    scoped_vault_id: ScopedVaultId,
    timestamp: DateTime<Utc>,
    created_by: DbActor,
}

impl WorkflowRequest {
    #[tracing::instrument("WorkflowRequest::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        sv_id: ScopedVaultId,
        obc_id: ObConfigurationId,
        created_by: DbActor,
    ) -> DbResult<Self> {
        // Deactivate old WorkflowRequests when making a new one
        Self::deactivate(conn, &sv_id, None, None)?;
        let new_row = NewWorkflowRequestRow {
            scoped_vault_id: sv_id,
            ob_configuration_id: obc_id,
            timestamp: Utc::now(),
            created_by,
        };
        let result = diesel::insert_into(workflow_request::table)
            .values(new_row)
            .get_result(conn.conn())?;
        Ok(result)
    }

    #[tracing::instrument("WorkflowRequest::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        obc_id: Option<&ObConfigurationId>,
        wf_id: Option<WorkflowId>,
    ) -> DbResult<()> {
        let mut query = diesel::update(workflow_request::table)
            .filter(workflow_request::scoped_vault_id.eq(sv_id))
            .filter(workflow_request::deactivated_at.is_null())
            .into_boxed();
        if let Some(obc_id) = obc_id {
            query = query.filter(workflow_request::ob_configuration_id.eq(obc_id));
        }

        query
            .set((
                workflow_request::deactivated_at.eq(Utc::now()),
                // TODO how does null work here
                workflow_request::deactivated_by_workflow_id.eq(wf_id),
            ))
            .execute(conn.conn())?;
        Ok(())
    }
}
