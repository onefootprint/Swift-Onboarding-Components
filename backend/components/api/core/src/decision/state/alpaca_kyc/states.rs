use std::sync::Arc;

use api_wire_types::DecisionRequest;
use async_trait::async_trait;
use db::models::{
    decision_intent::DecisionIntent,
    document_request::{DocumentRequest, NewDocumentRequestArgs},
    onboarding::{Onboarding, OnboardingUpdate},
    risk_signal::RiskSignal,
    risk_signal_group::RiskSignalGroup,
    scoped_vault::ScopedVault,
    vault::Vault,
    verification_result::VerificationResult,
    workflow::Workflow as DbWorkflow,
};

use either::Either;
use feature_flag::FeatureFlagClient;
use idv::incode::watchlist::response::WatchlistResultResponse;
use newtypes::{
    AlpacaKycConfig, DecisionStatus, FootprintReasonCode, OnboardingStatus, ReviewReason,
    RiskSignalGroupKind, VendorAPI,
};
use webhooks::WebhookClient;

use crate::{
    auth::tenant::AuthActor,
    decision::{
        self,
        features::risk_signals::{
            create_risk_signals_from_vendor_results, fetch_latest_risk_signals_map,
            risk_signal_group_struct::{self},
            save_risk_signals, RiskSignalGroupStruct,
        },
        onboarding::{Decision, DecisionReasonCodes, OnboardingRulesDecisionOutput},
        review::save_review_decision,
        state::{
            actions::{MakeDecision, WorkflowActions},
            common::{self, get_vres_id_for_fixture},
            Authorize, DocCollected, MakeVendorCalls, MakeWatchlistCheckCall, OnAction, ReviewCompleted,
            WorkflowState,
        },
        utils::FixtureDecision,
        vendor::{
            self, tenant_vendor_control::TenantVendorControl,
            vendor_api::vendor_api_response::build_vendor_response_map_from_vendor_results,
            vendor_result::VendorResult,
        },
    },
    errors::ApiResult,
    State,
};

use super::{
    AlpacaKycComplete, AlpacaKycDataCollection, AlpacaKycDecisioning, AlpacaKycDocCollection,
    AlpacaKycPendingReview, AlpacaKycState, AlpacaKycVendorCalls, AlpacaKycWatchlistCheck,
};

/////////////////////
/// DataCollection
/// ////////////////
impl AlpacaKycDataCollection {
    #[tracing::instrument("AlpacaKycDataCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, config: AlpacaKycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(AlpacaKycDataCollection {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            sv_id: sv.id,
            ob_id: ob.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<Authorize, AlpacaKycState> for AlpacaKycDataCollection {
    type AsyncRes = TenantVendorControl;

    #[tracing::instrument(
        "OnAction<Authorize, AlpacaKycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: Authorize,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // Write fingerprints
        common::write_authorized_fingerprints(state, &self.sv_id).await?;

        let tid = self.t_id.clone();
        let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.config).await?;

        Ok(tvc)
    }

    #[tracing::instrument("OnAction<Authorize, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(self, tvc: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<AlpacaKycState> {
        common::setup_kyc_onboarding_vreqs(conn, tvc, self.is_redo, &self.ob_id, &self.sv_id)?;

        Ok(AlpacaKycState::from(AlpacaKycVendorCalls {
            wf_id: self.wf_id,
            is_redo: self.is_redo,
            sv_id: self.sv_id,
            ob_id: self.ob_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for AlpacaKycDataCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::AlpacaKycState::DataCollection)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None // have to wait for user to complete Bifrost
    }
}

/////////////////////
/// VendorCalls
/// ////////////////
impl AlpacaKycVendorCalls {
    #[tracing::instrument("AlpacaKycVendorCalls::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, config: AlpacaKycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(AlpacaKycVendorCalls {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            sv_id: sv.id,
            ob_id: ob.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, AlpacaKycState> for AlpacaKycVendorCalls {
    type AsyncRes = (Vec<VendorResult>, Arc<dyn FeatureFlagClient>);

    #[tracing::instrument(
        "OnAction<MakeVendorCalls, AlpacaKycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok((
            common::make_outstanding_kyc_vendor_calls(state, &self.sv_id, &self.ob_id, &self.t_id).await?,
            state.feature_flag_client.clone(),
        ))
    }

    #[tracing::instrument("OnAction<MakeVendorCalls, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<AlpacaKycState> {
        let (vendor_results, ff_client) = async_res;
        let vault = Vault::get(conn, &self.sv_id)?;
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &vault, &self.t_id)?;
        let risk_signals: RiskSignalGroupStruct<risk_signal_group_struct::Kyc> =
            if let Some(fd) = fixture_decision {
                let reason_codes = decision::sandbox::get_fixture_reason_codes_alpaca(fd);
                let vres_id = get_vres_id_for_fixture(&vendor_results)?;

                RiskSignalGroupStruct {
                    footprint_reason_codes: reason_codes
                        .into_iter()
                        .map(|r| (r.0, r.1, vres_id.clone()))
                        .collect(),
                    group: risk_signal_group_struct::Kyc,
                }
            } else {
                let vendor_result_maps = build_vendor_response_map_from_vendor_results(&vendor_results)?;
                create_risk_signals_from_vendor_results(vendor_result_maps)?
            };

        save_risk_signals(conn, &self.sv_id, &risk_signals)?;

        // we might need doc signals here too, so we reload
        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;

        Ok(AlpacaKycState::from(AlpacaKycDecisioning {
            wf_id: self.wf_id,
            is_redo: self.is_redo,
            ob_id: self.ob_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
            vendor_results,
            risk_signals,
        }))
    }
}

impl WorkflowState for AlpacaKycVendorCalls {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::AlpacaKycState::VendorCalls)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls))
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl AlpacaKycDecisioning {
    #[tracing::instrument("AlpacaKycDecisioning::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, config: AlpacaKycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        let vendor_results = common::assert_kyc_vendor_calls_completed(state, &ob.id, &sv.id).await?;
        let svid = sv.id.clone();
        let risk_signals = state
            .db_pool
            .db_query(move |conn| fetch_latest_risk_signals_map(conn, &svid))
            .await??;

        Ok(AlpacaKycDecisioning {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
            vendor_results,
            risk_signals,
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision, AlpacaKycState> for AlpacaKycDecisioning {
    type AsyncRes = (Arc<dyn FeatureFlagClient>, Arc<dyn WebhookClient>);

    #[tracing::instrument(
        "OnAction<MakeDecision, AlpacaKycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok((state.feature_flag_client.clone(), state.webhook_client.clone()))
    }

    #[tracing::instrument("OnAction<MakeDecision, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<AlpacaKycState> {
        let (ff_client, webhook_client) = async_res;
        // TODO: pass in/otherwise specify that Watchlist reason codes should not be written based on the KYC vendor calls
        let vault = Vault::get(conn, &self.sv_id)?;
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &vault, &self.t_id)?;
        // TODO: reason_codes are produced in `MakeVendorCalls` on_commit, so untangle this from the util
        // TODO: load risk signals here, and use that to evaluate the rules
        let decision = if let Some(fixture_decision) = fixture_decision {
            common::alpaca_kyc_decision_from_fixture(fixture_decision)?
        } else {
            common::get_decision(&self, conn, self.risk_signals.clone(), &self.sv_id)?
        };

        // Now, we unhide the risk signals for the vendor that made the decision
        // TODO: what if doc failed by KYC passed? fix this
        let rsg = RiskSignalGroup::latest_by_kind(conn.conn(), &self.sv_id, RiskSignalGroupKind::Kyc)?;
        RiskSignal::unhide_risk_signals_for_risk_signal_group(
            conn,
            &rsg.id,
            vec![decision.output.decision.vendor_api],
        )?;

        match decision.decision.decision_status {
            DecisionStatus::Fail => {
                // If they hard fail, then we can immediatly save a Fail OBD/update onboarding.status = Fail
                common::save_kyc_decision(
                    conn,
                    webhook_client,
                    &self.ob_id,
                    &self.sv_id,
                    &self.wf_id,
                    self.vendor_results
                        .iter()
                        .map(|vr| vr.verification_result_id.clone())
                        .collect(),
                    decision,
                    self.is_redo,
                    fixture_decision.is_some(),
                    vec![],
                )?;
                Ok(AlpacaKycState::from(AlpacaKycComplete))
            }
            DecisionStatus::Pass => {
                // we update ob.status = Pending but cannot write an OBD yet (need to do watchlist checks next)
                if !self.is_redo {
                    let ob = Onboarding::lock(conn, &self.ob_id)?;
                    Onboarding::update(ob, conn, OnboardingUpdate::set_status(OnboardingStatus::Pending))?;
                }
                Ok(AlpacaKycState::from(AlpacaKycWatchlistCheck {
                    wf_id: self.wf_id,
                    is_redo: self.is_redo,
                    ob_id: self.ob_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                }))
            }
            DecisionStatus::StepUp => {
                // we set ob.status = incomplete (should be a no-op) but don't write an OBD yet
                if !self.is_redo {
                    let ob = Onboarding::lock(conn, &self.ob_id)?;
                    Onboarding::update(
                        ob,
                        conn,
                        OnboardingUpdate::set_status(OnboardingStatus::Incomplete),
                    )?;
                }
                let args = NewDocumentRequestArgs {
                    scoped_vault_id: self.sv_id.clone(),
                    ref_id: None,
                    workflow_id: Some(self.wf_id.clone()),
                    // TODO: should come from a config
                    should_collect_selfie: true,
                    only_us: true,
                    doc_type_restriction: None,
                };
                DocumentRequest::create(conn, args)?;

                Ok(AlpacaKycState::from(AlpacaKycDocCollection {
                    wf_id: self.wf_id,
                    is_redo: self.is_redo,
                    ob_id: self.ob_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                }))
            }
        }
    }
}

impl WorkflowState for AlpacaKycDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::AlpacaKycState::Decisioning)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision))
    }
}

/////////////////////
/// WatchlistCheck
/// ////////////////
impl AlpacaKycWatchlistCheck {
    #[tracing::instrument("AlpacaKycWatchlistCheck::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, config: AlpacaKycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(AlpacaKycWatchlistCheck {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeWatchlistCheckCall, AlpacaKycState> for AlpacaKycWatchlistCheck {
    type AsyncRes = (
        Either<(VerificationResult, WatchlistResultResponse), (VerificationResult, FixtureDecision)>,
        Vec<VendorResult>,
        Arc<dyn WebhookClient>,
    );

    #[tracing::instrument(
        "OnAction<MakeWatchlistCheckCall, AlpacaKycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeWatchlistCheckCall,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // TODO: query for already complete (Vreq/Vres) for edge case where server crashes after `make_watchlist_result_call` but before `on_commit` commits
        let sv_id = self.sv_id.clone();
        let (di, uv) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let di = DecisionIntent::get_or_create_onboarding_kyc(conn, &sv_id)?;
                let uv = Vault::get(conn, &sv_id)?;
                Ok((di, uv))
            })
            .await?;
        let tvc = TenantVendorControl::new(self.t_id.clone(), &state.db_pool, &state.config).await?;

        let fixture_decision =
            decision::utils::get_fixture_data_decision(state.feature_flag_client.clone(), &uv, &self.t_id)?;

        let watchlist_res = if let Some(fixture_decision) = fixture_decision {
            // TODO: since we are now saving a mock incode response, we could make the sandbox reason_code logic in `on_commit` just operate on the mocked vres instead of synthetically deriving from fixture_decision
            let vres = decision::sandbox::save_fixture_incode_watchlist_result(
                &state.db_pool,
                fixture_decision,
                &di.id,
                &self.sv_id,
                &uv.public_key,
            )
            .await?;

            Either::Right((vres, fixture_decision))
        } else {
            Either::Left(
                vendor::incode_watchlist::make_watchlist_result_call(
                    state,
                    &tvc,
                    &self.sv_id,
                    &di.id,
                    &uv.public_key,
                )
                .await?,
            )
        };

        let vendor_results =
            common::assert_kyc_vendor_calls_completed(state, &self.ob_id, &self.sv_id).await?;

        Ok((watchlist_res, vendor_results, state.webhook_client.clone()))
    }

    #[tracing::instrument("OnAction<MakeWatchlistCheckCall, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(self, res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<AlpacaKycState> {
        // TODO save Risk Signals + determine if we transition to PendingReview or Complete
        let (watchlist_res, vendor_results, webhook_client) = res;

        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;

        // Watchlist reason codes
        let wc_reason_codes = match &watchlist_res {
            Either::Left((vres, watchlist_res)) => {
                let wc_reason_codes =
                    decision::features::incode_watchlist::reason_codes_from_watchlist_result(watchlist_res);
                wc_reason_codes
                    .into_iter()
                    .map(|r| (r, VendorAPI::IncodeWatchlistCheck, vres.id.clone()))
                    .collect::<Vec<_>>()
            }
            Either::Right((vres, fixture_decision)) => match fixture_decision.0 {
                // For Alpaca sandbox fixtures, we treat "#fail" as meaning there was a watchlist hit. If we stepup (or pass), we don't simulate watchlist hits
                DecisionStatus::StepUp | DecisionStatus::Pass => vec![],
                DecisionStatus::Fail => vec![
                    // TODO: probably does make sense to just parse these instead from the dummy vres
                    (
                        FootprintReasonCode::WatchlistHitOfac,
                        VendorAPI::IncodeWatchlistCheck,
                        vres.id.clone(),
                    ),
                    (
                        FootprintReasonCode::AdverseMediaHit,
                        VendorAPI::IncodeWatchlistCheck,
                        vres.id.clone(),
                    ),
                ],
            },
        };

        let (adverse_media_reason_codes, watchlist_reason_codes) =
            partition_adverse_media_watchlist_reason_codes(wc_reason_codes.clone());

        // write reason codes from Incode watchlist/am
        RiskSignal::bulk_create(
            conn,
            &self.sv_id,
            adverse_media_reason_codes,
            RiskSignalGroupKind::AdverseMedia,
            false,
        )?;
        RiskSignal::bulk_create(
            conn,
            &self.sv_id,
            watchlist_reason_codes,
            RiskSignalGroupKind::Watchlist,
            false,
        )?;

        // For now, we need to re-run the KYC decisioning so we can get reason codes
        // and have these written at the same time as the Watchlist reason codes
        // and our OBD. (In future, we migrate risk_signal to point to VRes and can remove this temp hack)
        let is_sandbox = watchlist_res.is_right();
        let kyc_decision = if let Some((_, fixture_decision)) = watchlist_res.right() {
            common::alpaca_kyc_decision_from_fixture(fixture_decision)?
        } else {
            common::get_decision(&self, conn, risk_signals, &self.sv_id)?
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
                // TODO: fix this when this goes to rules
                vendor_api: VendorAPI::IncodeWatchlistCheck,
            }
        } else {
            Decision {
                decision_status: DecisionStatus::Fail,
                should_commit: true,
                create_manual_review: true,
                // TODO: fix this when this goes to rules
                vendor_api: VendorAPI::IncodeWatchlistCheck,
            }
        };
        let review_reasons = get_review_reasons(
            &wc_reason_codes.iter().map(|r| r.0.clone()).collect::<Vec<_>>(),
            doc_req.is_some(),
        );

        let decision = OnboardingRulesDecisionOutput {
            decision: final_decision.clone(),
            // in future we could have the wc_reason_codes.is_empty expresses as a rule and append that rule result here. This only impacts a log
            rules_triggered: kyc_decision.rules_triggered.clone(),
            rules_not_triggered: kyc_decision.rules_not_triggered.clone(),
        }
        .into();

        common::save_kyc_decision(
            conn,
            webhook_client,
            &self.ob_id,
            &self.sv_id,
            &self.wf_id,
            vendor_results
                .iter()
                .map(|vr| vr.verification_result_id.clone()) // TODO: a little funky- we maybe dont need the OBD<>VRes junction table anymore 
                .collect(),
            decision,
            self.is_redo,
            is_sandbox,
            review_reasons,
        )?;

        if final_decision.decision_status == DecisionStatus::Pass {
            Ok(AlpacaKycState::from(AlpacaKycComplete))
        } else {
            Ok(AlpacaKycState::from(AlpacaKycPendingReview {
                sv_id: self.sv_id,
                wf_id: self.wf_id,
            }))
        }
    }
}

impl WorkflowState for AlpacaKycWatchlistCheck {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::AlpacaKycState::WatchlistCheck)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall))
    }
}

/////////////////////
/// PendingReview
/// ////////////////
impl AlpacaKycPendingReview {
    #[tracing::instrument("AlpacaKycPendingReview::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: AlpacaKycConfig) -> ApiResult<Self> {
        let (_, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;
        Ok(AlpacaKycPendingReview {
            sv_id: sv.id,
            wf_id: workflow.id,
        })
    }
}

#[async_trait]
impl OnAction<ReviewCompleted, AlpacaKycState> for AlpacaKycPendingReview {
    type AsyncRes = (DecisionRequest, AuthActor);

    #[tracing::instrument(
        "OnAction<ReviewCompleted, AlpacaKycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        action: ReviewCompleted,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // TODO: maybe Action can be passed into on_commit too?
        let ReviewCompleted { decision, actor } = action;

        Ok((decision, actor))
    }

    #[tracing::instrument("OnAction<ReviewCompleted, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<AlpacaKycState> {
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
        Ok(AlpacaKycState::from(AlpacaKycComplete))
    }
}

impl WorkflowState for AlpacaKycPendingReview {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::AlpacaKycState::PendingReview)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None // have to wait for user to complete review
    }
}

/////////////////////
/// DocCollection
/// ////////////////
impl AlpacaKycDocCollection {
    #[tracing::instrument("AlpacaKycDocCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, config: AlpacaKycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(AlpacaKycDocCollection {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<DocCollected, AlpacaKycState> for AlpacaKycDocCollection {
    type AsyncRes = ();

    #[tracing::instrument(
        "OnAction<DocCollected, AlpacaKycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: DocCollected,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("OnAction<DocCollected, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(self, _async_res: Self::AsyncRes, _conn: &mut db::TxnPgConn) -> ApiResult<AlpacaKycState> {
        Ok(AlpacaKycState::from(AlpacaKycWatchlistCheck {
            wf_id: self.wf_id,
            is_redo: self.is_redo,
            ob_id: self.ob_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for AlpacaKycDocCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::AlpacaKycState::DocCollection)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None // have to wait for doc collection flow to finish
    }
}

// //////////////////
// Complete
// ////////////////
impl AlpacaKycComplete {
    #[tracing::instrument("AlpacaKycComplete::init", skip_all)]
    pub async fn init(_state: &State, _workflow: DbWorkflow, _config: AlpacaKycConfig) -> ApiResult<Self> {
        Ok(AlpacaKycComplete)
    }
}

impl WorkflowState for AlpacaKycComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::AlpacaKycState::Complete)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None // terminal state
    }
}

fn get_review_reasons(wc_reason_codes: &[FootprintReasonCode], collected_doc: bool) -> Vec<ReviewReason> {
    let adverse_media: bool = wc_reason_codes
        .iter()
        .any(|rs| rs == &FootprintReasonCode::AdverseMediaHit);

    let wl_hit = vec![
        FootprintReasonCode::WatchlistHitOfac,
        FootprintReasonCode::WatchlistHitNonSdn,
        FootprintReasonCode::WatchlistHitPep,
    ]
    .iter()
    .any(|r| wc_reason_codes.contains(r));

    let mut reasons = vec![];

    if adverse_media {
        reasons.push(ReviewReason::AdverseMediaHit);
    }
    if wl_hit {
        reasons.push(ReviewReason::WatchlistHit);
    }
    if collected_doc {
        reasons.push(ReviewReason::Document);
    }

    reasons
}

fn partition_adverse_media_watchlist_reason_codes(
    reason_codes: DecisionReasonCodes,
) -> (DecisionReasonCodes, DecisionReasonCodes) {
    reason_codes
        .into_iter()
        .partition(|(frc, _, _)| frc.is_adverse_media())
}

#[cfg(test)]
mod tests {
    use super::*;
    use newtypes::VerificationResultId;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case(vec![(FootprintReasonCode::WatchlistHitOfac)], false => vec![ReviewReason::WatchlistHit])]
    #[test_case(vec![(FootprintReasonCode::WatchlistHitOfac)], true => vec![ReviewReason::WatchlistHit, ReviewReason::Document])]
    #[test_case(vec![(FootprintReasonCode::WatchlistHitOfac), (FootprintReasonCode::WatchlistHitPep)], true => vec![ReviewReason::WatchlistHit, ReviewReason::Document])]
    #[test_case(vec![(FootprintReasonCode::AdverseMediaHit)], false => vec![ReviewReason::AdverseMediaHit])]
    #[test_case(vec![(FootprintReasonCode::AdverseMediaHit)], true => vec![ReviewReason::AdverseMediaHit, ReviewReason::Document])]
    #[test_case(vec![(FootprintReasonCode::AdverseMediaHit), (FootprintReasonCode::WatchlistHitNonSdn)], true => vec![ReviewReason::AdverseMediaHit, ReviewReason::WatchlistHit,  ReviewReason::Document])]

    fn test_get_review_reasons(
        wc_reason_codes: Vec<FootprintReasonCode>,
        collected_doc: bool,
    ) -> Vec<ReviewReason> {
        get_review_reasons(&wc_reason_codes, collected_doc)
    }

    fn drc(frc: FootprintReasonCode) -> (FootprintReasonCode, VendorAPI, VerificationResultId) {
        (
            frc,
            VendorAPI::IncodeWatchlistCheck,
            VerificationResultId::from_str("123").unwrap(),
        )
    }

    #[test_case(vec![drc(FootprintReasonCode::WatchlistHitOfac)] => (vec![], vec![drc(FootprintReasonCode::WatchlistHitOfac)]))]
    #[test_case(vec![drc(FootprintReasonCode::WatchlistHitOfac), drc(FootprintReasonCode::WatchlistHitNonSdn)] => (vec![], vec![drc(FootprintReasonCode::WatchlistHitOfac), drc(FootprintReasonCode::WatchlistHitNonSdn)]))]
    #[test_case(vec![drc(FootprintReasonCode::WatchlistHitOfac), drc(FootprintReasonCode::WatchlistHitNonSdn), drc(FootprintReasonCode::AdverseMediaHit)] => (vec![drc(FootprintReasonCode::AdverseMediaHit)], vec![drc(FootprintReasonCode::WatchlistHitOfac), drc(FootprintReasonCode::WatchlistHitNonSdn)]))]
    fn test_partition_adverse_media_watchlist_reason_codes(
        wc_reason_codes: DecisionReasonCodes,
    ) -> (DecisionReasonCodes, DecisionReasonCodes) {
        partition_adverse_media_watchlist_reason_codes(wc_reason_codes)
    }
}
