use super::DocumentState;
use super::MakeDecision;
use crate::decision::onboarding::RulesOutcome;
use crate::decision::risk;
use crate::decision::state::actions::DocCollected;
use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::OnAction;
use crate::decision::state::WorkflowState;
use crate::FpResult;
use crate::State;
use async_trait::async_trait;
use db::models::workflow::Workflow as DbWorkflow;
use newtypes::DataLifetimeSeqno;
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
    #[allow(unused)]
    sv_id: ScopedVaultId,
}

#[derive(Clone)]
pub struct DocumentComplete;

/////////////////////
/// DataCollection
/// ////////////////
impl DocumentDataCollection {
    #[tracing::instrument("DocumentDataCollection::init", skip_all)]
    pub async fn init(
        _: &State,
        workflow: DbWorkflow,
        _config: DocumentConfig,
        _seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
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

    fn default_action(&self, _seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl DocumentDecisioning {
    #[tracing::instrument("DocumentDecisioning::init", skip_all)]
    pub async fn init(
        _: &State,
        workflow: DbWorkflow,
        _config: DocumentConfig,
        _seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
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
        risk::save_final_decision(conn, &wf.id, RulesOutcome::RulesNotExecuted, None, vec![])?;
        Ok(DocumentState::from(DocumentComplete))
    }
}

impl WorkflowState for DocumentDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::DocumentState::Decisioning.into()
    }

    fn default_action(&self, seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision { seqno }))
    }
}

/////////////////////
/// Complete
/// ////////////////
impl DocumentComplete {
    #[tracing::instrument("DocumentComplete::init", skip_all)]
    pub async fn init(
        _state: &State,
        _workflow: DbWorkflow,
        _config: DocumentConfig,
        _seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
        Ok(DocumentComplete)
    }
}

impl WorkflowState for DocumentComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::DocumentState::Complete.into()
    }

    fn default_action(&self, _seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        None
    }
}
