use async_trait::async_trait;
use db::models::workflow::Workflow as DbWorkflow;

use newtypes::KybConfig;

use super::{
    KybAwaitingAsyncVendors, KybAwaitingBoKyc, KybComplete, KybDataCollection, KybDecisioning, KybState,
    KybVendorCalls,
};
use crate::decision::state::{
    actions::{Authorize, WorkflowActions},
    AsyncVendorCallsCompleted, BoKycCompleted, MakeDecision, MakeVendorCalls, WorkflowState,
};
use crate::{decision::state::OnAction, errors::ApiResult, State};

/////////////////////
/// DataCollection
/// ////////////////
/// Starting state that indicates we are waiting for all business information to be entered + authorized
impl KybDataCollection {
    #[tracing::instrument("KybDataCollection::init", skip_all)]
    pub async fn init(_state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        Ok(KybDataCollection { wf_id: workflow.id })
    }
}

#[async_trait]
impl OnAction<Authorize, KybState> for KybDataCollection {
    type AsyncRes = ();

    #[tracing::instrument(
        "KybDataCollection#OnAction<Authorize, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: Authorize,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // TODO: write fingerprints here
        Ok(())
    }

    #[tracing::instrument("KybDataCollection#OnAction<Authorize, KybState>::on_commit", skip_all)]
    fn on_commit(self, _async_res: (), _conn: &mut db::TxnPgConn) -> ApiResult<KybState> {
        Ok(KybState::from(KybAwaitingBoKyc { wf_id: self.wf_id }))
    }
}

impl WorkflowState for KybDataCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::DataCollection)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// AwaitingBoKyc
/// ////////////////
/// After all business information is collected, we wait in this state for all BO's to complete KYC
impl KybAwaitingBoKyc {
    #[tracing::instrument("KybAwaitingBoKyc::init", skip_all)]
    pub async fn init(_state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        Ok(KybAwaitingBoKyc { wf_id: workflow.id })
    }
}

#[async_trait]
impl OnAction<BoKycCompleted, KybState> for KybAwaitingBoKyc {
    type AsyncRes = ();

    #[tracing::instrument(
        "KybAwaitingBoKyc#OnAction<BoKycCompleted, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: BoKycCompleted,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("KybAwaitingBoKyc#OnAction<BoKycCompleted, KybState>::on_commit", skip_all)]
    fn on_commit(self, _async_res: (), _conn: &mut db::TxnPgConn) -> ApiResult<KybState> {
        // TODO: set status = pending
        Ok(KybState::from(KybVendorCalls { wf_id: self.wf_id }))
    }
}

impl WorkflowState for KybAwaitingBoKyc {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::AwaitingBoKyc)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// VendorCalls
/// ////////////////
/// In this state we initiate our asyncronous Middesk state machine. In the future we may also add syncronous KYB vendors here (eg: Lexis + Experian)
impl KybVendorCalls {
    #[tracing::instrument("KybVendorCalls::init", skip_all)]
    pub async fn init(_state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        Ok(KybVendorCalls { wf_id: workflow.id })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, KybState> for KybVendorCalls {
    type AsyncRes = ();

    #[tracing::instrument(
        "KybVendorCalls#OnAction<MakeVendorCalls, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // TODO: kick off Middesk state machine here
        Ok(())
    }

    #[tracing::instrument("KybVendorCalls#OnAction<MakeVendorCalls, KybState>::on_commit", skip_all)]
    fn on_commit(self, _async_res: (), _conn: &mut db::TxnPgConn) -> ApiResult<KybState> {
        // TODO: set idv_reqs_initiated_at here i guess?
        Ok(KybState::from(KybAwaitingAsyncVendors { wf_id: self.wf_id }))
    }
}

impl WorkflowState for KybVendorCalls {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::VendorCalls)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls))
    }
}

/////////////////////
/// AwaitingAsyncVendors
/// ////////////////
/// We remain in this state until the Middesk asyncronous flow completes.
impl KybAwaitingAsyncVendors {
    #[tracing::instrument("KybAwaitingAsyncVendors::init", skip_all)]
    pub async fn init(_state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        Ok(KybAwaitingAsyncVendors { wf_id: workflow.id })
    }
}

#[async_trait]
impl OnAction<AsyncVendorCallsCompleted, KybState> for KybAwaitingAsyncVendors {
    type AsyncRes = ();

    #[tracing::instrument(
        "KybAwaitingAsyncVendors#OnAction<AsyncVendorCallsCompleted, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: AsyncVendorCallsCompleted,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument(
        "KybAwaitingAsyncVendors#OnAction<AsyncVendorCallsCompleted, KybState>::on_commit",
        skip_all
    )]
    fn on_commit(self, _async_res: (), _conn: &mut db::TxnPgConn) -> ApiResult<KybState> {
        Ok(KybState::from(KybDecisioning { wf_id: self.wf_id }))
    }
}

impl WorkflowState for KybAwaitingAsyncVendors {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::AwaitingAsyncVendors)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl KybDecisioning {
    #[tracing::instrument("KybDecisioning::init", skip_all)]
    pub async fn init(_state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        Ok(KybDecisioning { wf_id: workflow.id })
    }
}

#[async_trait]
impl OnAction<MakeDecision, KybState> for KybDecisioning {
    type AsyncRes = ();

    #[tracing::instrument(
        "KybDecisioning#OnAction<MakeDecision, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("KybDecisioning#OnAction<MakeDecision, KybState>::on_commit", skip_all)]
    fn on_commit(self, _async_res: (), _conn: &mut db::TxnPgConn) -> ApiResult<KybState> {
        // TODO: get fixture decision or real decision from executing rules
        // TODO: figure out how to slot KYB into the KycRuleGroup type of dealios
        Ok(KybState::from(KybComplete {}))
    }
}

impl WorkflowState for KybDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::Decisioning)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision))
    }
}

/////////////////////
/// Complete
/// ////////////////
impl KybComplete {
    #[tracing::instrument("KybComplete::init", skip_all)]
    pub async fn init(_state: &State, _workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        Ok(KybComplete {})
    }
}

impl WorkflowState for KybComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::Complete)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}
