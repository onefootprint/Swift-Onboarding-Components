use std::sync::Arc;

use api_wire_types::DecisionRequest;
use async_trait::async_trait;
use db::{
    models::{
        decision_intent::DecisionIntent,
        document_request::DocumentRequest,
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::OnboardingDecision,
        risk_signal::RiskSignal,
        scoped_vault::ScopedVault,
        vault::Vault,
        verification_request::VerificationRequest,
        workflow::Workflow,
    },
    DbError,
};
use either::Either;
use feature_flag::{FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use idv::incode::{
    watchlist::{response::WatchlistResultResponse, IncodeWatchlistCheckRequest},
    IncodeStartOnboardingRequest,
};
use newtypes::{
    vendor_credentials::IncodeCredentialsWithToken, DecisionStatus, FootprintReasonCode, OnboardingStatus,
    Vendor, VendorAPI, WorkflowKind,
};

use crate::{
    auth::tenant::AuthActor,
    decision::{
        self,
        onboarding::{Decision, OnboardingRulesDecisionOutput},
        review::save_review_decision,
        state::{
            actions::MakeDecision, common, Authorize, DocCollected, MakeVendorCalls, MakeWatchlistCheckCall,
            OnAction, ReviewCompleted,
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
impl OnAction<Authorize, States> for DataCollection {
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

    fn on_commit(self, tvc: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<States> {
        common::setup_kyc_onboarding_vreqs(conn, tvc, false, &self.ob_id, &self.sv_id)?;

        Ok(VendorCalls {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            ob_id: self.ob_id,
            t_id: self.t_id,
        }
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
impl OnAction<MakeVendorCalls, States> for VendorCalls {
    type AsyncRes = Vec<VendorResult>;

    async fn execute_async_idempotent_actions(
        &self,
        action: MakeVendorCalls,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        common::make_outstanding_kyc_vendor_calls(state, &self.sv_id, &self.ob_id, &self.t_id).await
    }

    fn on_commit(self, vendor_results: Vec<VendorResult>, conn: &mut db::TxnPgConn) -> ApiResult<States> {
        Ok(Decisioning {
            wf_id: self.wf_id,
            ob_id: self.ob_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
            vendor_results,
        }
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
impl OnAction<MakeDecision, States> for Decisioning {
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

    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<States> {
        let fixture_decision = async_res;

        // TODO: pass in/otherwise specify Alpaca Rules
        // TODO: pass in/otherwise specify that Watchlist reason codes should not be written based on the KYC vendor calls
        let kyc_decision = if let Some(fixture_decision) = fixture_decision {
            common::alpaca_kyc_decision_from_fixture(fixture_decision)
        } else {
            common::get_kyc_decision(conn, self.vendor_results.clone())?
        };

        match kyc_decision.0.decision.decision_status {
            DecisionStatus::Fail => {
                // If they hard fail, then we can immediatly save a Fail OBD/update onboarding.status = Fail
                common::save_kyc_decision(
                    conn,
                    &self.ob_id,
                    &self.wf_id,
                    self.vendor_results
                        .iter()
                        .map(|vr| vr.verification_result_id.clone())
                        .collect(),
                    &kyc_decision,
                    false,
                    fixture_decision.is_some(),
                )?;
                Ok(States::from(Complete))
            }
            DecisionStatus::Pass => {
                // we update ob.status = Pending but cannot write an OBD yet (need to do watchlist checks next)
                Onboarding::update_by_id(
                    conn,
                    &self.ob_id,
                    OnboardingUpdate::set_status(OnboardingStatus::Pending),
                )?;
                Ok(States::from(WatchlistCheck {
                    wf_id: self.wf_id,
                    ob_id: self.ob_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                }))
            }
            DecisionStatus::StepUp => {
                // we set ob.status = incomplete (should be a no-op) but don't write an OBD yet
                Onboarding::update_by_id(
                    conn,
                    &self.ob_id,
                    OnboardingUpdate::set_status(OnboardingStatus::Incomplete),
                )?;
                let doc_req = DocumentRequest::create(
                    conn,
                    self.sv_id.clone(),
                    None,
                    true, // TODO: maybe should_collect_selfie should come from a config
                    None,
                )?;
                Ok(DocCollection {
                    wf_id: self.wf_id,
                    ob_id: self.ob_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                }
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
impl OnAction<MakeWatchlistCheckCall, States> for WatchlistCheck {
    type AsyncRes = (
        Either<WatchlistResultResponse, FixtureDecision>,
        Vec<VendorResult>,
    );

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

        let fixture_decision = decision::utils::get_fixture_data_decision(
            state,
            state.feature_flag_client.clone(),
            &self.sv_id,
            &self.t_id,
        )
        .await?;

        let watchlist_res = if let Some(fixture_decision) = fixture_decision {
            Either::Right(fixture_decision)
        } else {
            Either::Left(
                vendor::incode_watchlist::make_watchlist_result_call(
                    state,
                    &tvc,
                    &self.sv_id,
                    &di.id,
                    &vault.public_key,
                )
                .await?,
            )
        };

        let vendor_results =
            common::assert_kyc_vendor_calls_completed(state, &self.ob_id, &self.sv_id).await?;

        Ok((watchlist_res, vendor_results))
    }

    fn on_commit(self, res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<States> {
        // TODO save Risk Signals + determine if we transition to PendingReview or Complete
        let (watchlist_res, vendor_results) = res;

        // TODO: !! Hack: this will retrieve VRes's from every vendor api, including watchlist check + doc scan.
        // Soon, we will migrate RiskSignal to point to VRes and then we will just write risk signals when we save the vres
        // but for now we need to do this hack where we write all risk signals at once when we write an OBD.
        // The reason codes for the risk signals based on the KYC vendor calls are generated via kyc_features. So for now, we
        // need to filter all the Vres's we have to just the ones from the KYC vendor calls so we can pass those to kyc_features and generate
        // the KYC reason_codes we need to write.
        // A nice alternative here might be to make a new DI for KYC vs Incode flow vs watchlist check. But im not sure if thats worth the effort
        // given the migration of RiskSignal to VRes will remove the need for this hack anyway
        let kyc_vendor_results: Vec<_> = vendor_results
            .clone()
            .into_iter()
            .filter(|vr| VendorAPI::from(&vr.response.response).is_kyc_call())
            .collect();

        // Watchlist reason codes
        let wc_reason_codes = match &watchlist_res {
            Either::Left(watchlist_res) => {
                let wc_reason_codes =
                    decision::features::incode_watchlist::reason_codes_from_watchlist_result(watchlist_res);
                wc_reason_codes
                    .into_iter()
                    .map(|r| (r, vec![Vendor::Incode]))
                    .collect::<Vec<_>>()
            }
            Either::Right(fixture_decision) => match fixture_decision.0 {
                // For Alpaca sandbox fixtures, we treat "#fail" as meaning there was a watchlist hit. If we stepup (or pass), we don't simulate watchlist hits
                DecisionStatus::StepUp | DecisionStatus::Pass => vec![],
                DecisionStatus::Fail => vec![(FootprintReasonCode::WatchlistHitOfac, vec![Vendor::Incode])],
            },
        };

        // For now, we need to re-run the KYC decisioning so we can get reason codes
        // and have these written at the same time as the Watchlist reason codes
        // and our OBD. (In future, we migrate risk_signal to point to VRes and can remove this temp hack)
        let is_sandbox = watchlist_res.is_right();
        let (kyc_decision, kyc_reason_codes) = if let Some(fixture_decision) = watchlist_res.right() {
            common::alpaca_kyc_decision_from_fixture(fixture_decision)
        } else {
            common::get_kyc_decision(conn, kyc_vendor_results)?
        };

        // If we collected a doc, we go to review and fail OBD even if no hits
        // TODO: query by wf_id instead
        let doc_req = DocumentRequest::get(conn, &self.sv_id)?;

        // TODO: in future could express this as a Rule or at least an engine decision
        let final_decision = if wc_reason_codes.is_empty() && doc_req.is_none() {
            Decision {
                decision_status: DecisionStatus::Pass,
                should_commit: true,
                create_manual_review: false,
            }
        } else {
            Decision {
                decision_status: DecisionStatus::Fail,
                should_commit: false,
                create_manual_review: true,
            }
        };

        let decision = (
            OnboardingRulesDecisionOutput {
                decision: final_decision.clone(),
                // in future we could have the wc_reason_codes.is_empty expresses as a rule and append that rule result here. This only impacts a log
                rules_triggered: kyc_decision.rules_triggered,
                rules_not_triggered: kyc_decision.rules_not_triggered,
            },
            kyc_reason_codes
                .into_iter()
                .chain(wc_reason_codes.into_iter())
                .collect(),
        );
        common::save_kyc_decision(
            conn,
            &self.ob_id,
            &self.wf_id,
            vendor_results
                .iter()
                .map(|vr| vr.verification_result_id.clone()) // TODO: a little funky- we maybe dont need the OBD<>VRes junction table anymore 
                .collect(),
            &decision,
            false,
            is_sandbox,
        )?;

        if final_decision.decision_status == DecisionStatus::Pass {
            Ok(States::from(Complete))
        } else {
            Ok(States::from(PendingReview {
                sv_id: self.sv_id,
                wf_id: self.wf_id,
            }))
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
impl OnAction<ReviewCompleted, States> for PendingReview {
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

    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<States> {
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
        Ok(Complete.into())
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
impl OnAction<DocCollected, States> for DocCollection {
    type AsyncRes = ();

    async fn execute_async_idempotent_actions(
        &self,
        _action: DocCollected,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<States> {
        Ok(WatchlistCheck {
            wf_id: self.wf_id,
            ob_id: self.ob_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        }
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
