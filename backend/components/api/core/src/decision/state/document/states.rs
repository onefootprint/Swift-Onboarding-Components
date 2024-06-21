use super::DocumentState;
use super::MakeDecision;
use crate::decision::features::risk_signals::fetch_latest_risk_signals_map;
use crate::decision::onboarding::Decision;
use crate::decision::risk;
use crate::decision::state::actions::DocCollected;
use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::OnAction;
use crate::decision::state::WorkflowState;
use crate::FpResult;
use crate::State;
use async_trait::async_trait;
use db::models::workflow::Workflow as DbWorkflow;
use newtypes::DocumentConfig;
use newtypes::Locked;
use newtypes::ScopedVaultId;

///
/// States

#[derive(Clone)]
pub struct DocumentDataCollection {
    sv_id: ScopedVaultId,
}

#[derive(Clone)]
pub struct DocumentDecisioning {
    sv_id: ScopedVaultId,
}

#[derive(Clone)]
pub struct DocumentComplete;

/////////////////////
/// DataCollection
/// ////////////////
impl DocumentDataCollection {
    #[tracing::instrument("DocumentDataCollection::init", skip_all)]
    pub async fn init(_: &State, workflow: DbWorkflow, _config: DocumentConfig) -> FpResult<Self> {
        Ok(DocumentDataCollection {
            sv_id: workflow.scoped_vault_id.clone(),
        })
    }
}

#[async_trait]
impl OnAction<DocCollected, DocumentState> for DocumentDataCollection {
    type AsyncRes = ();

    #[tracing::instrument(
        "OnAction<DocCollected, DocumentState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: DocCollected,
        _: &State,
    ) -> FpResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("OnAction<DocCollected, DocumentState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _: Self::AsyncRes,
        _conn: &mut db::TxnPgConn,
    ) -> FpResult<DocumentState> {
        Ok(DocumentState::from(DocumentDecisioning { sv_id: self.sv_id }))
    }
}

impl WorkflowState for DocumentDataCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::DocumentState::DataCollection.into()
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl DocumentDecisioning {
    #[tracing::instrument("DocumentDecisioning::init", skip_all)]
    pub async fn init(_: &State, workflow: DbWorkflow, _config: DocumentConfig) -> FpResult<Self> {
        Ok(DocumentDecisioning {
            sv_id: workflow.scoped_vault_id.clone(),
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision, DocumentState> for DocumentDecisioning {
    type AsyncRes = ();

    #[tracing::instrument(
        "OnAction<MakeDecision, DocumentState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(&self, _: MakeDecision, _: &State) -> FpResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("OnAction<MakeDecision, DocumentState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        _: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> FpResult<DocumentState> {
        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;
        let vres_ids = risk_signals.verification_result_ids();

        risk::save_final_decision(conn, &wf.id, vres_ids, Decision::RulesNotExecuted, None, vec![])?;
        Ok(DocumentState::from(DocumentComplete))
    }
}

impl WorkflowState for DocumentDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::DocumentState::Decisioning.into()
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision))
    }
}

/////////////////////
/// Complete
/// ////////////////
impl DocumentComplete {
    #[tracing::instrument("DocumentComplete::init", skip_all)]
    pub async fn init(_state: &State, _workflow: DbWorkflow, _config: DocumentConfig) -> FpResult<Self> {
        Ok(DocumentComplete)
    }
}

impl WorkflowState for DocumentComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::DocumentState::Complete.into()
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}
