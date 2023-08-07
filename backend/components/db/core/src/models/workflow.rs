use std::collections::HashMap;

use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{AlpacaKycState, DocumentState, KybState, WorkflowFixtureResult};
use newtypes::{Locked, ScopedVaultId, WorkflowConfig, WorkflowId, WorkflowKind, WorkflowState};
use serde::{Deserialize, Serialize};

use super::workflow_event::WorkflowEvent;
use crate::models::vault::Vault;
use crate::{DbResult, PgConn, TxnPgConn};
use db_schema::schema::workflow;
use newtypes::KycState;

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
    pub config: WorkflowConfig,
    pub fixture_result: Option<WorkflowFixtureResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = workflow)]
pub struct NewWorkflow {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: WorkflowKind,
    pub state: WorkflowState,
    pub config: WorkflowConfig,
    // One day we'll get rid of this
    pub fixture_result: Option<WorkflowFixtureResult>,
}

impl Workflow {
    #[tracing::instrument("Workflow::insert", skip_all)]
    pub fn insert(conn: &mut PgConn, new_workflow: NewWorkflow) -> DbResult<Self> {
        let res = diesel::insert_into(workflow::table)
            .values(new_workflow)
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Workflow::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        config: WorkflowConfig,
        fixture_result: Option<WorkflowFixtureResult>,
    ) -> DbResult<Self> {
        let kind = config.kind();
        let initial_state = match kind {
            WorkflowKind::AlpacaKyc => WorkflowState::AlpacaKyc(AlpacaKycState::DataCollection),
            WorkflowKind::Kyc => WorkflowState::Kyc(KycState::DataCollection),
            WorkflowKind::Document => WorkflowState::Document(DocumentState::DataCollection),
            WorkflowKind::Kyb => WorkflowState::Kyb(KybState::DataCollection),
        };
        let new_workflow = NewWorkflow {
            created_at: Utc::now(),
            scoped_vault_id: sv_id.clone(),
            kind,
            state: initial_state,
            config,
            fixture_result,
        };

        Self::insert(conn, new_workflow)
    }

    #[tracing::instrument("Workflow::get", skip_all)]
    pub fn get(conn: &mut PgConn, workflow_id: &WorkflowId) -> DbResult<Self> {
        let res = workflow::table
            .filter(workflow::id.eq(workflow_id))
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Workflow::get_with_vault", skip_all)]
    pub fn get_with_vault(conn: &mut PgConn, id: &WorkflowId) -> DbResult<(Self, Vault)> {
        use db_schema::schema::{scoped_vault, vault};
        let res = workflow::table
            .filter(workflow::id.eq(id))
            .inner_join(scoped_vault::table.inner_join(vault::table))
            .select((workflow::all_columns, vault::all_columns))
            .get_result::<(Self, Vault)>(conn)?;
        Ok(res)
    }

    #[tracing::instrument("Workflow::get_bulk", skip_all)]
    pub fn get_bulk(conn: &mut PgConn, ids: Vec<WorkflowId>) -> DbResult<HashMap<WorkflowId, Self>> {
        let res = workflow::table
            .filter(workflow::id.eq_any(ids))
            .get_results::<Self>(conn)?
            .into_iter()
            .map(|w| (w.id.clone(), w))
            .collect();

        Ok(res)
    }

    #[tracing::instrument("Workflow::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &WorkflowId) -> DbResult<Locked<Self>> {
        let result = workflow::table
            .filter(workflow::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("Workflow::update_state", skip_all)]
    pub fn update_state(
        conn: &mut TxnPgConn,
        workflow: Locked<Self>,
        new_state: WorkflowState,
    ) -> DbResult<Self> {
        let wf = workflow.into_inner();
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(&wf.id))
            .set(workflow::state.eq(new_state))
            .get_result(conn.conn())?;
        WorkflowEvent::create(conn, wf.id, wf.state, new_state)?;
        Ok(result)
    }

    #[tracing::instrument("Workflow::update_state", skip_all)]
    pub fn update_fixture_result(
        conn: &mut TxnPgConn,
        id: &WorkflowId,
        fixture_result: WorkflowFixtureResult,
    ) -> DbResult<Self> {
        let result = diesel::update(workflow::table)
            .filter(workflow::id.eq(id))
            .set(workflow::fixture_result.eq(fixture_result))
            .get_result(conn.conn())?;
        Ok(result)
    }

    // TODO: maybe in future we have a concept of only 1 active workflow at a time and this queries for that instead
    #[tracing::instrument("Workflow::latest", skip_all)]
    pub fn latest(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Option<Self>> {
        let res = workflow::table
            .filter(workflow::scoped_vault_id.eq(scoped_vault_id))
            .order_by(workflow::created_at.desc())
            .first(conn)
            .optional()?;
        Ok(res)
    }

    #[tracing::instrument("Workflow::latest_by_kind", skip_all)]
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
    use newtypes::KycConfig;
    use newtypes::KycState;
    use std::str::FromStr;

    #[db_test]
    fn test(conn: &mut TestPgConn) {
        let state = KycState::VendorCalls;
        let wf_state: WorkflowState = state.into();
        let config = WorkflowConfig::Kyc(KycConfig { is_redo: false });
        let wf = Workflow::insert(
            conn,
            NewWorkflow {
                created_at: Utc::now(),
                scoped_vault_id: ScopedVaultId::from_str("sv_123").unwrap(),
                kind: (&wf_state).into(),
                state: wf_state,
                config,
                fixture_result: None,
            },
        )
        .unwrap();
        assert!(wf.kind == WorkflowKind::Kyc);
        assert!(wf.state == WorkflowState::Kyc(KycState::VendorCalls));
        assert!(wf.config == WorkflowConfig::Kyc(KycConfig { is_redo: false }));
    }

    #[db_test]
    fn test_update(conn: &mut TestPgConn) {
        let s: WorkflowState = KycState::VendorCalls.into();
        let config = WorkflowConfig::Kyc(KycConfig { is_redo: false });
        let wf = Workflow::insert(
            conn,
            NewWorkflow {
                created_at: Utc::now(),
                scoped_vault_id: ScopedVaultId::from_str("sv_123").unwrap(),
                kind: (&s).into(),
                state: s,
                config,
                fixture_result: None,
            },
        )
        .unwrap();

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
