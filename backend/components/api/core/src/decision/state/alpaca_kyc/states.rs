use async_trait::async_trait;
use db::models::workflow::Workflow;

use crate::{
    decision::state::{OnAction, WorkflowStates},
    errors::ApiResult,
    State,
};

use super::{AdverseMediaCall, AlpacaCall, KycDecisioning, MakeAdverseMediaCall, MakeKycDecision, States};

/////////////////////
/// KycDecisioning
/// ////////////////
impl KycDecisioning {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(KycDecisioning)
    }
}

#[async_trait]
impl OnAction<MakeKycDecision> for KycDecisioning {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeKycDecision,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        Ok(States::from(AdverseMediaCall).into())
    }
}

/////////////////////
/// AdverseMediaCall
/// ////////////////
impl AdverseMediaCall {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(AdverseMediaCall)
    }
}

#[async_trait]
impl OnAction<MakeAdverseMediaCall> for AdverseMediaCall {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeAdverseMediaCall,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        Ok(States::from(AlpacaCall).into())
    }
}

/////////////////////
/// AlpacaCall
/// ////////////////
impl AlpacaCall {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(AlpacaCall)
    }
}
