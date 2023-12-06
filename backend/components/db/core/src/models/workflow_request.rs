use crate::DbError;
use crate::DbResult;
use crate::PgConn;
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
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub created_by: DbActor,
    /// The workflow_id created for this WorkflowRequest
    pub workflow_id: Option<WorkflowId>,
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
    #[tracing::instrument("WorkflowRequest::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &WorkflowRequestId) -> DbResult<Self> {
        let result = workflow_request::table
            .filter(workflow_request::id.eq(id))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("WorkflowRequest::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        sv_id: ScopedVaultId,
        obc_id: ObConfigurationId,
        created_by: DbActor,
    ) -> DbResult<Self> {
        // Deactivate old WorkflowRequests when making a new one
        Self::deactivate(conn, &sv_id, None)?;
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

    #[tracing::instrument("WorkflowRequest::set_wf_id", skip_all)]
    pub fn set_wf_id(conn: &mut TxnPgConn, id: &WorkflowRequestId, wf_id: &WorkflowId) -> DbResult<()> {
        let results = diesel::update(workflow_request::table)
            .filter(workflow_request::id.eq(id))
            .filter(workflow_request::workflow_id.is_null())
            .set(workflow_request::workflow_id.eq(wf_id))
            .get_results::<Self>(conn.conn())?;
        if results.is_empty() {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        Ok(())
    }

    #[tracing::instrument("WorkflowRequest::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        obc_id: Option<&ObConfigurationId>,
    ) -> DbResult<()> {
        let mut query = diesel::update(workflow_request::table)
            .filter(workflow_request::scoped_vault_id.eq(sv_id))
            .filter(workflow_request::deactivated_at.is_null())
            .into_boxed();
        if let Some(obc_id) = obc_id {
            query = query.filter(workflow_request::ob_configuration_id.eq(obc_id));
        }

        query
            .set(workflow_request::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;
        Ok(())
    }
}
