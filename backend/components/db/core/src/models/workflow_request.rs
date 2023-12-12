use std::collections::HashMap;

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
use newtypes::WorkflowRequestConfig;
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
    /// Information on what kind of Workflow to create from this request
    pub config: WorkflowRequestConfig,
    /// The note sent to the user via SMS when the trigger is created
    pub note: Option<String>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = workflow_request)]
struct NewWorkflowRequestRow {
    ob_configuration_id: ObConfigurationId,
    scoped_vault_id: ScopedVaultId,
    timestamp: DateTime<Utc>,
    created_by: DbActor,
    config: WorkflowRequestConfig,
    note: Option<String>,
}

pub struct NewWorkflowRequestArgs {
    pub ob_configuration_id: ObConfigurationId,
    pub scoped_vault_id: ScopedVaultId,
    pub created_by: DbActor,
    pub config: WorkflowRequestConfig,
    pub note: Option<String>,
}

impl WorkflowRequest {
    #[tracing::instrument("WorkflowRequest::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &WorkflowRequestId, sv_id: &ScopedVaultId) -> DbResult<Self> {
        let result = workflow_request::table
            .filter(workflow_request::id.eq(id))
            .filter(workflow_request::scoped_vault_id.eq(sv_id))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("WorkflowRequest::get", skip_all)]
    pub fn get_active(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Option<Self>> {
        let result = workflow_request::table
            .filter(workflow_request::scoped_vault_id.eq(sv_id))
            .filter(workflow_request::deactivated_at.is_null())
            .get_result(conn)
            .optional()?;
        Ok(result)
    }

    #[tracing::instrument("Workflow::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<WorkflowRequestId>,
    ) -> DbResult<HashMap<WorkflowRequestId, Self>> {
        let res = workflow_request::table
            .filter(workflow_request::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|wfr| (wfr.id.clone(), wfr))
            .collect();

        Ok(res)
    }

    #[tracing::instrument("WorkflowRequest::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewWorkflowRequestArgs) -> DbResult<Self> {
        let NewWorkflowRequestArgs {
            scoped_vault_id,
            ob_configuration_id,
            created_by,
            config,
            note,
        } = args;
        // Deactivate old WorkflowRequests when making a new one
        Self::deactivate(conn, &scoped_vault_id, None)?;
        let new_row = NewWorkflowRequestRow {
            scoped_vault_id,
            ob_configuration_id,
            timestamp: Utc::now(),
            created_by,
            config,
            note,
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
