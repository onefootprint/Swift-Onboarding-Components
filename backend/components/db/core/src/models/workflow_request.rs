use super::scoped_vault::ScopedVault;
use super::workflow_request_junction::NewWorkflowRequestJunctionRow;
use super::workflow_request_junction::WorkflowRequestJunction;
use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::scoped_vault;
use db_schema::schema::workflow_request;
use db_schema::schema::workflow_request_junction;
use diesel::dsl::exists;
use diesel::prelude::*;
use itertools::chain;
use itertools::Itertools;
use newtypes::DbActor;
use newtypes::ObConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::VaultKind;
use newtypes::WorkflowRequestConfig;
use newtypes::WorkflowRequestId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = workflow_request)]
pub struct WorkflowRequest {
    pub id: WorkflowRequestId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub timestamp: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub ob_configuration_id: ObConfigurationId,
    pub created_by: DbActor,
    /// Information on what kind of Workflow to create from this request
    pub config: WorkflowRequestConfig,
    /// The note sent to the user via SMS when the trigger is created
    pub note: Option<String>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = workflow_request)]
struct NewWorkflowRequestRow<'a> {
    ob_configuration_id: &'a ObConfigurationId,
    timestamp: DateTime<Utc>,
    created_by: &'a DbActor,
    config: &'a WorkflowRequestConfig,
    note: Option<String>,
}

pub struct NewWorkflowRequestArgs<'a> {
    pub ob_configuration_id: &'a ObConfigurationId,
    pub su_id: &'a ScopedVaultId,
    pub sb_id: Option<&'a ScopedVaultId>,
    pub created_by: &'a DbActor,
    pub config: &'a WorkflowRequestConfig,
    pub note: Option<String>,
}

impl WorkflowRequest {
    #[tracing::instrument("WorkflowRequest::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &WorkflowRequestId, sv_id: &ScopedVaultId) -> DbResult<Self> {
        let result = workflow_request::table
            .inner_join(workflow_request_junction::table)
            .filter(workflow_request::id.eq(id))
            .filter(workflow_request_junction::scoped_vault_id.eq(sv_id))
            .select(workflow_request::all_columns)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("WorkflowRequest::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Option<Self>> {
        let result = workflow_request::table
            .inner_join(workflow_request_junction::table)
            .filter(workflow_request_junction::scoped_vault_id.eq(sv_id))
            .filter(workflow_request::deactivated_at.is_null())
            .select(workflow_request::all_columns)
            .get_result(conn)
            .optional()?;
        Ok(result)
    }

    #[tracing::instrument("Workflow::get_bulk_with_user", skip_all)]
    pub fn get_bulk_with_user(
        conn: &mut PgConn,
        ids: Vec<WorkflowRequestId>,
    ) -> DbResult<HashMap<WorkflowRequestId, (Self, ScopedVault)>> {
        let res = workflow_request::table
            .filter(workflow_request::id.eq_any(ids))
            .inner_join(workflow_request_junction::table.inner_join(scoped_vault::table))
            // Always fetch the person for whom the WFR is created, regardless of whether the WFR is also for a business
            .filter(scoped_vault::kind.eq(VaultKind::Person))
            .select((workflow_request::all_columns, scoped_vault::all_columns))
            .get_results::<(Self, ScopedVault)>(conn)?
            .into_iter()
            .map(|(wfr, su)| (wfr.id.clone(), (wfr, su)))
            .collect();

        Ok(res)
    }

    #[tracing::instrument("WorkflowRequest::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewWorkflowRequestArgs) -> DbResult<Self> {
        let NewWorkflowRequestArgs {
            su_id,
            sb_id,
            ob_configuration_id,
            created_by,
            config,
            note,
        } = args;
        // Deactivate old WorkflowRequests when making a new one
        Self::deactivate(conn, su_id, None)?;
        if let Some(sb_id) = sb_id {
            Self::deactivate(conn, sb_id, None)?;
        }
        let new_row = NewWorkflowRequestRow {
            ob_configuration_id,
            timestamp: Utc::now(),
            created_by,
            config,
            note,
        };
        let result = diesel::insert_into(workflow_request::table)
            .values(new_row)
            .get_result::<Self>(conn.conn())?;

        // Link the new WorkflowRequest to the scoped user (and optionally scoped business)
        let wfr_junctions = chain!(
            Some(NewWorkflowRequestJunctionRow {
                workflow_request_id: &result.id,
                scoped_vault_id: su_id,
                kind: VaultKind::Person,
            }),
            sb_id.map(|sb_id| NewWorkflowRequestJunctionRow {
                workflow_request_id: &result.id,
                scoped_vault_id: sb_id,
                kind: VaultKind::Business,
            })
        )
        .collect_vec();
        WorkflowRequestJunction::bulk_create(conn, wfr_junctions)?;
        Ok(result)
    }

    #[tracing::instrument("WorkflowRequest::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        obc_id: Option<&ObConfigurationId>,
    ) -> DbResult<()> {
        let mut query = diesel::update(workflow_request::table)
            .filter(exists(
                workflow_request_junction::table
                    .filter(workflow_request_junction::scoped_vault_id.eq(sv_id))
                    .filter(workflow_request_junction::workflow_request_id.eq(workflow_request::id)),
            ))
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
