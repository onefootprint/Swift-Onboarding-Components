use std::sync::Arc;

use api_wire_types::DecisionRequest;
use async_trait::async_trait;
use db::{
    models::{
        decision_intent::DecisionIntent, document_request::DocumentRequest, manual_review::ManualReview,
        onboarding_decision::OnboardingDecision, risk_signal::RiskSignal, scoped_vault::ScopedVault,
        vault::Vault, verification_request::VerificationRequest, workflow::Workflow,
    },
    DbError,
};
use feature_flag::{FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use idv::incode::{
    watchlist::{response::WatchlistResultResponse, IncodeWatchlistCheckRequest},
    IncodeStartOnboardingRequest,
};
use newtypes::{vendor_credentials::IncodeCredentialsWithToken, DecisionStatus, Vendor, VendorAPI};

use crate::{
    auth::tenant::AuthActor,
    decision::{
        self,
        review::save_review_decision,
        state::{
            actions::MakeDecision, common, Authorize, DocCollected, MakeVendorCalls, MakeWatchlistCheckCall,
            OnAction, ReviewCompleted, WorkflowStates,
        },
        utils::FixtureDecision,
        vendor::{self, tenant_vendor_control::TenantVendorControl, vendor_result::VendorResult},
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
            wf_id: workflow.id,
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
            wf_id: self.wf_id,
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
            wf_id: workflow.id,
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
            wf_id: self.wf_id,
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
            wf_id: workflow.id,
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
            vendor_results,
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision> for Decisioning {
    type AsyncRes = Option<FixtureDecision>;

    async fn execute_async_idempotent_actions(
        &self,
        action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let fixture_decision = decision::utils::get_fixture_data_decision(
            state,
            state.feature_flag_client.clone(),
            &self.sv_id,
            &self.t_id,
        )
        .await?;

        Ok(fixture_decision)
    }

    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        let fixture_decision = async_res;

        // TODO: pass in/otherwise specify Alpaca Rules
        // TODO: pass in/otherwise specify that Watchlist reason codes should not be written based on the KYC vendor calls
        let decision_output = common::create_kyc_decision(
            conn,
            &self.t_id,
            &self.ob_id,
            fixture_decision,
            self.vendor_results,
            false,
            &self.wf_id,
        )?;

        match decision_output.decision_status {
            DecisionStatus::Fail => Ok(States::from(Complete).into()),
            DecisionStatus::Pass => Ok(States::from(WatchlistCheck {
                wf_id: self.wf_id,
                ob_id: self.ob_id,
                sv_id: self.sv_id,
                t_id: self.t_id,
            })
            .into()),
            DecisionStatus::StepUp => {
                let doc_req = DocumentRequest::create(
                    conn,
                    self.sv_id.clone(),
                    None,
                    true, // TODO: maybe should_collect_selfie should come from a config
                )?;
                Ok(States::from(DocCollection {
                    wf_id: self.wf_id,
                    ob_id: self.ob_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                })
                .into())
            }
        }
    }
}

/////////////////////
/// WatchlistCheck
/// ////////////////
impl WatchlistCheck {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(WatchlistCheck {
            wf_id: workflow.id,
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeWatchlistCheckCall> for WatchlistCheck {
    type AsyncRes = WatchlistResultResponse;

    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeWatchlistCheckCall,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // TODO: query for already complete (Vreq/Vres) for edge case where server crashes after `make_watchlist_result_call` but before `on_commit` commits
        let sv_id = self.sv_id.clone();
        let (di, vault) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let di = DecisionIntent::get_or_create_onboarding_kyc(conn, &sv_id)?;
                let uv = Vault::get(conn, &sv_id)?;
                Ok((di, uv))
            })
            .await?;
        let tvc = TenantVendorControl::new(
            self.t_id.clone(),
            &state.db_pool,
            &state.enclave_client,
            &state.config,
        )
        .await?;

        let watchlist_res = vendor::incode_watchlist::make_watchlist_result_call(
            state,
            &tvc,
            &self.sv_id,
            &di.id,
            &vault.public_key,
        )
        .await?;
        Ok(watchlist_res)
    }

    fn on_commit(
        self,
        watchlist_res: WatchlistResultResponse,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<WorkflowStates> {
        // TODO save Risk Signals + determine if we transition to PendingReview or Complete

        let reason_codes =
            decision::features::incode_watchlist::reason_codes_from_watchlist_result(watchlist_res);
        let signals = reason_codes
            .clone()
            .into_iter()
            .map(|r| (r, vec![Vendor::Incode]))
            .collect::<Vec<_>>();
        if !signals.is_empty() {
            // TODO: this is sketch and we should probably rethink the data models around OBD/risk signals/reviews/etc
            let sv = ScopedVault::get(conn, &self.sv_id)?;
            let obd = OnboardingDecision::latest_footprint_actor_decision(
                conn,
                &sv.fp_id,
                &sv.tenant_id,
                sv.is_live,
            )?
            .ok_or(DbError::RelatedObjectNotFound)?;
            let _risk_signals = RiskSignal::bulk_create(conn, obd.id, signals)?;
        }

        let doc_req = DocumentRequest::get(conn, &self.sv_id)?;

        // also always go to PendingReview if doc was collected
        if reason_codes.is_empty() && doc_req.is_none() {
            Ok(States::from(Complete).into())
        } else {
            let _review = ManualReview::create(conn, self.ob_id)?; // TODO: this will crash if a review already exists- which it shouldn't- but still kinda sketch
            Ok(States::from(PendingReview {
                sv_id: self.sv_id,
                wf_id: self.wf_id,
            })
            .into())
        }
    }
}

/////////////////////
/// PendingReview
/// ////////////////
impl PendingReview {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let (_, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;
        Ok(PendingReview {
            sv_id: sv.id,
            wf_id: workflow.id,
        })
    }
}

#[async_trait]
impl OnAction<ReviewCompleted> for PendingReview {
    type AsyncRes = (DecisionRequest, AuthActor);

    async fn execute_async_idempotent_actions(
        &self,
        action: ReviewCompleted,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // TODO: maybe Action can be passed into on_commit too?
        let ReviewCompleted { decision, actor } = action;

        Ok((decision, actor))
    }

    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        let (decision, actor) = async_res;
        let sv = ScopedVault::get(conn, &self.sv_id)?;
        let _obd = save_review_decision(
            conn,
            &sv.fp_id,
            &sv.tenant_id,
            sv.is_live,
            decision,
            actor,
            Some(self.wf_id),
        )?;
        Ok(States::from(Complete).into())
    }
}

/////////////////////
/// DocCollection
/// ////////////////
impl DocCollection {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(DocCollection {
            wf_id: workflow.id,
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
        })
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
        Ok(States::from(WatchlistCheck {
            wf_id: self.wf_id,
            ob_id: self.ob_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        })
        .into())
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
