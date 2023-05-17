use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{Locked, ScopedVaultId, WorkflowId, WorkflowKind, WorkflowState};
use serde::{Deserialize, Serialize};

use crate::{schema::workflow, DbResult, PgConn, TxnPgConn};

use super::workflow_event::WorkflowEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = workflow)]
pub struct Workflow {
    pub id: WorkflowId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: WorkflowKind,
    pub state: WorkflowState,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = workflow)]
pub struct NewWorkflow {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: WorkflowKind,
    pub state: WorkflowState,
}

impl Workflow {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
        scoped_vault_id: ScopedVaultId,
        kind: WorkflowKind,
        state: WorkflowState,
    ) -> DbResult<Self> {
        let new_workflow = NewWorkflow {
            created_at: Utc::now(),
            scoped_vault_id,
            kind,
            state,
        };

        let res = diesel::insert_into(workflow::table)
            .values(new_workflow)
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument(skip_all)]
    pub fn get(conn: &mut PgConn, workflow_id: &WorkflowId) -> DbResult<Self> {
        let res = workflow::table
            .filter(workflow::id.eq(workflow_id))
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument(skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &WorkflowId) -> DbResult<Locked<Self>> {
        let result = workflow::table
            .filter(workflow::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument(skip_all)]
    pub fn update_state(
        conn: &mut TxnPgConn,
        workflow: Locked<Self>,
        new_state: WorkflowState,
    ) -> DbResult<Self> {
        let wfid = workflow.id.clone();
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(wfid))
            .set(workflow::state.eq(new_state.clone()))
            .get_result(conn.conn())?;

        let wfid = workflow.id.clone();
        let curr_state = workflow.state.clone();
        let _wfe = WorkflowEvent::create(conn, wfid, curr_state, new_state)?;

        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn latest_by_kind(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: WorkflowKind,
    ) -> DbResult<Option<Self>> {
        let res = workflow::table
            .filter(workflow::scoped_vault_id.eq(scoped_vault_id))
            .filter(workflow::kind.eq(kind))
            .order_by(workflow::created_at.desc())
            .first(conn)
            .optional()?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{models::workflow_event::WorkflowEvent, tests::prelude::*};
    use macros::db_test;
    use newtypes::KycState;
    use std::str::FromStr;

    #[db_test]
    fn test(conn: &mut TestPgConn) {
        let state = KycState::VendorCalls;
        let wf_state: WorkflowState = state.into();
        let wf = Workflow::create(
            conn,
            ScopedVaultId::from_str("sv_123").unwrap(),
            (&wf_state).into(),
            wf_state,
        )
        .unwrap();
        assert!(wf.kind == WorkflowKind::Kyc);
        assert!(wf.state == WorkflowState::Kyc(KycState::VendorCalls));
    }

    #[db_test]
    fn test_update(conn: &mut TestPgConn) {
        let s: WorkflowState = KycState::VendorCalls.into();
        let wf = Workflow::create(conn, ScopedVaultId::from_str("sv_123").unwrap(), (&s).into(), s).unwrap();

        let wf = Workflow::lock(conn, &wf.id).unwrap();
        let wfid = wf.id.clone();
        let updated_wf = Workflow::update_state(conn, wf, WorkflowState::Kyc(KycState::Decisioning)).unwrap();
        assert!(updated_wf.state == WorkflowState::Kyc(KycState::Decisioning));

        let wfe = WorkflowEvent::list_for_workflow(conn, &wfid).unwrap();
        assert_eq!(1, wfe.len());
        let wfe = wfe.first().unwrap();
        assert!(wfe.from_state == WorkflowState::Kyc(KycState::VendorCalls));
        assert!(wfe.to_state == WorkflowState::Kyc(KycState::Decisioning));
    }
}
