use async_trait::async_trait;
use db::models::workflow::Workflow;

use crate::{
    decision::state::{
        actions::MakeDecision, Authorize, DocCollected, MakeVendorCalls, MakeWatchlistCheckCall, OnAction,
        ReviewCompleted, WorkflowStates,
    },
    errors::ApiResult,
    State,
};

use super::{
    Complete, DataCollection, Decisioning, DocCollection, PendingReview, States, VendorCalls, WatchlistCheck,
};

/////////////////////
/// DataCollection
/// ////////////////
impl DataCollection {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(DataCollection)
    }
}

#[async_trait]
impl OnAction<Authorize> for DataCollection {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: Authorize,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        Ok(States::from(VendorCalls).into())
    }
}

/////////////////////
/// VendorCalls
/// ////////////////
impl VendorCalls {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(VendorCalls)
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls> for VendorCalls {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        Ok(States::from(Decisioning).into())
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl Decisioning {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(Decisioning)
    }
}

#[async_trait]
impl OnAction<MakeDecision> for Decisioning {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        Ok(States::from(WatchlistCheck).into())
    }
}

/////////////////////
/// WatchlistCheck
/// ////////////////
impl WatchlistCheck {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(WatchlistCheck)
    }
}

#[async_trait]
impl OnAction<MakeWatchlistCheckCall> for WatchlistCheck {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeWatchlistCheckCall,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        Ok(States::from(PendingReview).into())
    }
}

/////////////////////
/// PendingReview
/// ////////////////
impl PendingReview {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(PendingReview)
    }
}

#[async_trait]
impl OnAction<ReviewCompleted> for PendingReview {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: ReviewCompleted,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        Ok(States::from(Complete).into())
    }
}

/////////////////////
/// DocCollection
/// ////////////////
impl DocCollection {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(DocCollection)
    }
}

#[async_trait]
impl OnAction<DocCollected> for DocCollection {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: DocCollected,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        Ok(States::from(WatchlistCheck).into())
    }
}

/////////////////////
/// Complete
/// ////////////////
impl Complete {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(Complete)
    }
}
