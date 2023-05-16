use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{ScopedVaultId, WorkflowId, WorkflowKind, WorkflowState};
use serde::{Deserialize, Serialize};

use crate::{schema::workflow, DbResult, PgConn};

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
    pub fn get(conn: &mut PgConn, workflow_id: &WorkflowId) -> DbResult<Option<Self>> {
        let res: Option<_> = workflow::table
            .filter(workflow::id.eq(workflow_id))
            .get_result(conn)
            .optional()?;

        Ok(res)
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
}
