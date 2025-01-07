use super::AdhocVendorCallState;
use crate::decision::state::actions::MakeVendorCalls;
use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::OnAction;
use crate::decision::state::WorkflowState;
use crate::State;
use api_errors::FpResult;
use async_trait::async_trait;
use db::models::workflow::Workflow as DbWorkflow;
use newtypes::DataLifetimeSeqno;
use newtypes::Locked;
use newtypes::ScopedVaultId;

#[derive(Clone)]

pub struct AdhocVendorCallVendorCalls {
    #[allow(unused)]
    sv_id: ScopedVaultId,
}

impl AdhocVendorCallVendorCalls {
    pub async fn init(_state: &State, workflow: DbWorkflow) -> FpResult<Self> {
        Ok(AdhocVendorCallVendorCalls {
            sv_id: workflow.scoped_vault_id,
        })
    }
}


/////////////////////
/// MakeVendorCalls
/// ////////////////
#[async_trait]
impl OnAction<MakeVendorCalls, AdhocVendorCallState> for AdhocVendorCallVendorCalls {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        _state: &State,
    ) -> FpResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _: Self::AsyncRes,
        _conn: &mut db::TxnPgConn,
    ) -> FpResult<AdhocVendorCallState> {
        // TODO: Risk Signals
        Ok(AdhocVendorCallState::Complete(AdhocVendorCallComplete))
    }
}


#[derive(Clone)]
pub struct AdhocVendorCallComplete;

/////////////////////
/// Complete
/// ////////////////
impl AdhocVendorCallComplete {
    pub async fn init(_state: &State, _workflow: DbWorkflow) -> FpResult<Self> {
        Ok(AdhocVendorCallComplete)
    }
}

impl WorkflowState for AdhocVendorCallVendorCalls {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::AdhocVendorCall(newtypes::AdhocVendorCallState::VendorCalls)
    }

    fn default_action(&self, _seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        None
    }
}


impl WorkflowState for AdhocVendorCallComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::AdhocVendorCall(newtypes::AdhocVendorCallState::Complete)
    }

    fn default_action(&self, _seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        None
    }
}
