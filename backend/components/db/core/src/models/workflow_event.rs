use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::workflow_event;
use diesel::prelude::*;
use newtypes::WorkflowEventId;
use newtypes::WorkflowId;
use newtypes::WorkflowState;

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = workflow_event)]
pub struct WorkflowEvent {
    pub id: WorkflowEventId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub workflow_id: WorkflowId,
    pub from_state: WorkflowState,
    pub to_state: WorkflowState,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = workflow_event)]
pub struct NewWorkflowEvent {
    pub created_at: DateTime<Utc>,
    pub workflow_id: WorkflowId,
    pub from_state: WorkflowState,
    pub to_state: WorkflowState,
}

impl WorkflowEvent {
    #[tracing::instrument("WorkflowEvent::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        workflow_id: WorkflowId,
        from_state: WorkflowState,
        to_state: WorkflowState,
    ) -> DbResult<Self> {
        let new_workflow_event = NewWorkflowEvent {
            created_at: Utc::now(),
            workflow_id,
            from_state,
            to_state,
        };

        let res = diesel::insert_into(workflow_event::table)
            .values(new_workflow_event)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument("WorkflowEvent::list_for_workflow", skip_all)]
    pub fn list_for_workflow(conn: &mut PgConn, workflow_id: &WorkflowId) -> DbResult<Vec<Self>> {
        let results = workflow_event::table
            .filter(workflow_event::workflow_id.eq(workflow_id))
            .order_by(workflow_event::created_at.asc())
            .get_results(conn)?;
        Ok(results)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::KycState;
    use std::str::FromStr;

    #[db_test]
    fn test(conn: &mut TestPgConn) {
        let wfe = WorkflowEvent::create(
            conn,
            WorkflowId::from_str("wf_123").unwrap(),
            KycState::VendorCalls.into(),
            KycState::Decisioning.into(),
        )
        .unwrap();
        assert!(wfe.from_state == WorkflowState::Kyc(KycState::VendorCalls));
        assert!(wfe.to_state == WorkflowState::Kyc(KycState::Decisioning));
    }
}
