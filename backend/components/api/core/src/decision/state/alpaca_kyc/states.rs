use async_trait::async_trait;
use db::models::workflow::Workflow;

use crate::{
    decision::{
        state::{
            actions::MakeDecision, common, Authorize, DocCollected, MakeVendorCalls, MakeWatchlistCheckCall,
            OnAction, ReviewCompleted, WorkflowStates,
        },
        vendor::{tenant_vendor_control::TenantVendorControl, vendor_result::VendorResult},
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
    // TODO: pass in (Alpaca)KycConfig later and enable `redo`
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(DataCollection {
            sv_id: sv.id,
            ob_id: ob.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<Authorize> for DataCollection {
    type AsyncRes = TenantVendorControl;

    async fn execute_async_idempotent_actions(
        &self,
        action: Authorize,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let svid = self.sv_id.clone();
        let tid = self.t_id.clone();
        let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.enclave_client, &state.config).await?;

        Ok(tvc)
    }

    fn on_commit(self, tvc: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        common::setup_kyc_onboarding_vreqs(conn, tvc, false, &self.ob_id, &self.sv_id)?;

        Ok(States::from(VendorCalls {
            sv_id: self.sv_id,
            ob_id: self.ob_id,
            t_id: self.t_id,
        })
        .into())
    }
}

/////////////////////
/// VendorCalls
/// ////////////////
impl VendorCalls {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(VendorCalls {
            sv_id: sv.id,
            ob_id: ob.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls> for VendorCalls {
    type AsyncRes = Vec<VendorResult>;

    async fn execute_async_idempotent_actions(
        &self,
        action: MakeVendorCalls,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        common::make_outstanding_kyc_vendor_calls(state, &self.sv_id, &self.ob_id, &self.t_id).await
    }

    fn on_commit(
        self,
        vendor_results: Vec<VendorResult>,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<WorkflowStates> {
        Ok(States::from(Decisioning {
            ob_id: self.ob_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
            vendor_results,
        })
        .into())
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl Decisioning {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        let vendor_results = common::assert_kyc_vendor_calls_completed(state, &ob.id, &sv.id).await?;

        Ok(Decisioning {
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
            vendor_results,
        })
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
