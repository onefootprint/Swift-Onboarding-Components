use std::sync::Arc;

use api_wire_types::DecisionRequest;
use async_trait::async_trait;
use db::models::{
    decision_intent::DecisionIntent,
    document_request::{DocumentRequest, NewDocumentRequestArgs},
    ob_configuration::ObConfiguration,
    risk_signal::{NewRiskSignalInfo, RiskSignal},
    risk_signal_group::RiskSignalGroup,
    vault::Vault,
    verification_result::VerificationResult,
    workflow::{Workflow as DbWorkflow, WorkflowUpdate},
};

use either::Either;
use feature_flag::FeatureFlagClient;
use idv::incode::watchlist::response::WatchlistResultResponse;
use newtypes::{
    AlpacaKycConfig, DecisionIntentKind, DecisionStatus, FootprintReasonCode, Locked, OnboardingStatus,
    ReviewReason, RiskSignalGroupKind, VendorAPI,
};

use crate::{
    auth::tenant::AuthActor,
    decision::{
        self,
        features::risk_signals::{
            create_risk_signals_from_vendor_results, fetch_latest_risk_signals_map,
            risk_signal_group_struct::{self},
            save_risk_signals, RiskSignalGroupStruct,
        },
        onboarding::{
            Decision, DecisionResult, OnboardingRulesDecisionOutput, WaterfallOnboardingRulesDecisionOutput,
        },
        review::save_review_decision,
        state::{
            actions::{MakeDecision, WorkflowActions},
            common::{self, get_vres_id_for_fixture},
            Authorize, DocCollected, MakeVendorCalls, MakeWatchlistCheckCall, OnAction, ReviewCompleted,
            WorkflowState,
        },
        utils::FixtureDecision,
        vendor::{
            self, incode_watchlist::WatchlistCheckKind, tenant_vendor_control::TenantVendorControl,
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
    pub async fn init(state: &State, workflow: DbWorkflow, _: AlpacaKycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(AlpacaKycDataCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            // TODO can probably get rid of t_id on these states too
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<Authorize, AlpacaKycState> for AlpacaKycDataCollection {
    type AsyncRes = ();

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
        common::write_authorized_fingerprints(state, &self.wf_id).await?;

        Ok(())
    }

    #[tracing::instrument("OnAction<Authorize, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(self, wf: Locked<DbWorkflow>, _: (), conn: &mut db::TxnPgConn) -> ApiResult<AlpacaKycState> {
        DbWorkflow::update(wf, conn, WorkflowUpdate::set_status(OnboardingStatus::Pending))?;

        Ok(AlpacaKycState::from(AlpacaKycVendorCalls {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
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
    pub async fn init(state: &State, workflow: DbWorkflow, _: AlpacaKycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(AlpacaKycVendorCalls {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, AlpacaKycState> for AlpacaKycVendorCalls {
    type AsyncRes = (
        Option<Vec<NewRiskSignalInfo>>,
        Vec<VendorResult>,
        Arc<dyn FeatureFlagClient>,
    );

    #[tracing::instrument(
        "OnAction<MakeVendorCalls, AlpacaKycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let vendor_results = common::run_kyc_vendor_calls(state, &self.wf_id, &self.t_id).await?;
        let ocr_reason_codes =
            common::maybe_generate_ocr_reason_codes(state, &self.wf_id, &self.sv_id).await?;

        Ok((
            ocr_reason_codes,
            vendor_results,
            state.feature_flag_client.clone(),
        ))
    }

    #[tracing::instrument("OnAction<MakeVendorCalls, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<AlpacaKycState> {
        let (ocr_reason_codes, vendor_results, ff_client) = async_res;
        let (vw, obc) = common::get_vw_and_obc(conn, &self.sv_id, &self.wf_id)?;

        // Save OCR risk signals for doc-first OBC if necessary
        if let Some(ocr_reason_codes) = ocr_reason_codes {
            // We save under the same RSG created during the incode state machine if it ran so we
            // don't invalidate the old RSG
            let rsg = RiskSignalGroup::get_or_create(conn, &self.sv_id, RiskSignalGroupKind::Doc)?;
            RiskSignal::bulk_add(conn, ocr_reason_codes, false, rsg.id)?;
        }

        let fixture_decision =
            decision::utils::get_fixture_data_decision(ff_client, &vw.vault, &wf, &self.t_id)?;
        let risk_signals: RiskSignalGroupStruct<risk_signal_group_struct::Kyc> =
            if let Some(fd) = fixture_decision {
                let reason_codes = decision::sandbox::get_fixture_reason_codes_alpaca(fd, &vw, &obc);
                let vres_id = get_vres_id_for_fixture(&vendor_results)?;

                RiskSignalGroupStruct {
                    footprint_reason_codes: reason_codes
                        .into_iter()
                        .map(|r| (r.0, r.1, vres_id.clone()))
                        .collect(),
                    group: risk_signal_group_struct::Kyc,
                }
            } else {
                let (results_map, ids_map) = build_vendor_response_map_from_vendor_results(&vendor_results)?;
                create_risk_signals_from_vendor_results((&results_map, &ids_map), vw, obc)?
            };

        save_risk_signals(conn, &self.sv_id, &risk_signals, false)?;

        // we might need doc signals here too, so we reload
        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;

        Ok(AlpacaKycState::from(AlpacaKycDecisioning {
            wf_id: self.wf_id,
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
    pub async fn init(state: &State, workflow: DbWorkflow, _: AlpacaKycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        let vendor_results = common::get_latest_vendor_results(state, &sv.id).await?;
        let svid = sv.id.clone();
        let risk_signals = state
            .db_pool
            .db_query(move |conn| fetch_latest_risk_signals_map(conn, &svid))
            .await??;

        Ok(AlpacaKycDecisioning {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
            vendor_results,
            risk_signals,
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision, AlpacaKycState> for AlpacaKycDecisioning {
    type AsyncRes = Arc<dyn FeatureFlagClient>;

    #[tracing::instrument(
        "OnAction<MakeDecision, AlpacaKycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(state.feature_flag_client.clone())
    }

    #[tracing::instrument("OnAction<MakeDecision, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        ff_client: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<AlpacaKycState> {
        let v = Vault::get(conn, &self.sv_id)?;
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &v, &wf, &self.t_id)?;
        // TODO: reason_codes are produced in `MakeVendorCalls` on_commit, so untangle this from the util
        // TODO: load risk signals here, and use that to evaluate the rules
        let decision = if let Some(fixture_decision) = fixture_decision {
            common::alpaca_kyc_decision_from_fixture(fixture_decision)?
        } else {
            common::get_decision(&self, conn, self.risk_signals.clone(), &wf, &v)?
        };

        match decision.final_kyc_decision()?.decision.decision_status {
            DecisionStatus::Fail => {
                // If they hard fail, then we can immediatly save a Fail OBD/update onboarding.status = Fail
                common::save_kyc_decision(
                    conn,
                    &self.sv_id,
                    &wf,
                    self.vendor_results
                        .iter()
                        .map(|vr| vr.verification_result_id.clone())
                        .collect(),
                    decision.into(),
                    fixture_decision.is_some(),
                    vec![],
                )?;
                Ok(AlpacaKycState::from(AlpacaKycComplete))
            }
            DecisionStatus::Pass => {
                // TODO Why set this to pending here? it should be pending already from vendor reqs
                let update = WorkflowUpdate::set_status(OnboardingStatus::Pending);
                DbWorkflow::update(wf, conn, update)?;
                Ok(AlpacaKycState::from(AlpacaKycWatchlistCheck {
                    wf_id: self.wf_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                }))
            }
            DecisionStatus::StepUp => {
                // we set wf.status = incomplete (should be a no-op) but don't write an OBD yet
                let update = WorkflowUpdate::set_status(OnboardingStatus::Incomplete);
                DbWorkflow::update(wf, conn, update)?;
                let args = NewDocumentRequestArgs {
                    scoped_vault_id: self.sv_id.clone(),
                    ref_id: None,
                    workflow_id: self.wf_id.clone(),
                    // TODO: should come from a config
                    should_collect_selfie: true,
                };
                DocumentRequest::create(conn, args)?;

                Ok(AlpacaKycState::from(AlpacaKycDocCollection {
                    wf_id: self.wf_id,
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
    pub async fn init(state: &State, workflow: DbWorkflow, _: AlpacaKycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(AlpacaKycWatchlistCheck {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeWatchlistCheckCall, AlpacaKycState> for AlpacaKycWatchlistCheck {
    type AsyncRes = (
        Either<(VerificationResult, WatchlistResultResponse), (VerificationResult, FixtureDecision)>,
        Vec<VendorResult>,
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
        let wf_id = self.wf_id.clone();
        let (di, wf, v) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let (wf, v) = DbWorkflow::get_with_vault(conn, &wf_id)?;
                let di = DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &sv_id,
                    &wf_id,
                    DecisionIntentKind::WatchlistCheck,
                )?;
                Ok((di, wf, v))
            })
            .await?;
        let tvc = TenantVendorControl::new(
            self.t_id.clone(),
            &state.db_pool,
            &state.config,
            &state.enclave_client,
        )
        .await?;

        let ff_client = state.feature_flag_client.clone();
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &v, &wf, &self.t_id)?;

        let watchlist_res = if let Some(fixture_decision) = fixture_decision {
            // TODO: since we are now saving a mock incode response, we could make the sandbox reason_code logic in `on_commit` just operate on the mocked vres instead of synthetically deriving from fixture_decision
            let (vres, _) = decision::sandbox::save_fixture_incode_watchlist_result(
                &state.db_pool,
                fixture_decision,
                &di.id,
                &self.sv_id,
                &v.public_key,
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
                    &v.public_key,
                    WatchlistCheckKind::MakeNewSearch,
                )
                .await?,
            )
        };

        let vendor_results = common::get_latest_vendor_results(state, &self.sv_id).await?;

        Ok((watchlist_res, vendor_results))
    }

    #[tracing::instrument("OnAction<MakeWatchlistCheckCall, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<AlpacaKycState> {
        // TODO save Risk Signals + determine if we transition to PendingReview or Complete
        let (watchlist_res, vendor_results) = res;
        let v = Vault::get(conn, &wf.scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;

        // Watchlist reason codes
        let wc_reason_codes = match &watchlist_res {
            Either::Left((vres, watchlist_res)) => {
                let wc_reason_codes =
                    decision::features::incode_watchlist::reason_codes_from_watchlist_result(
                        watchlist_res,
                        &obc.enhanced_aml(),
                    );
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

        // write reason codes from Incode watchlist/am
        RiskSignal::bulk_create(
            conn,
            &self.sv_id,
            wc_reason_codes.clone(),
            RiskSignalGroupKind::Aml,
            false,
        )?;

        // For now, we need to re-run the KYC decisioning so we can get reason codes
        // and have these written at the same time as the Watchlist reason codes
        // and our OBD. (In future, we migrate risk_signal to point to VRes and can remove this temp hack)
        let is_sandbox = watchlist_res.is_right();
        let kyc_decision = if let Some((_, fixture_decision)) = watchlist_res.right() {
            common::alpaca_kyc_decision_from_fixture(fixture_decision)?
        } else {
            common::get_decision(&self, conn, risk_signals, &wf, &v)?
        }
        .final_kyc_decision()?;

        // If we collected a doc, we go to review and fail OBD even if no hits
        let doc_req = DocumentRequest::get(conn, &self.wf_id)?;

        // TODO: in future could express this as a Rule or at least an engine decision
        let final_decision = if wc_reason_codes.is_empty() && doc_req.is_none() {
            Decision {
                decision_status: DecisionStatus::Pass,
                should_commit: true,
                create_manual_review: false,
                // TODO: fix this when this goes to rules
                vendor_apis: vec![VendorAPI::IncodeWatchlistCheck],
            }
        } else {
            Decision {
                decision_status: DecisionStatus::Fail,
                should_commit: true,
                create_manual_review: true,
                // TODO: fix this when this goes to rules
                vendor_apis: vec![VendorAPI::IncodeWatchlistCheck],
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
            rules_not_triggered: kyc_decision.rules_not_triggered,
        };

        let output = WaterfallOnboardingRulesDecisionOutput::new(
            DecisionResult::Evaluated(decision),
            DecisionResult::NotRequired,
            DecisionResult::NotRequired,
        );

        common::save_kyc_decision(
            conn,
            &self.sv_id,
            &wf,
            vendor_results
                .iter()
                .map(|vr| vr.verification_result_id.clone()) // TODO: a little funky- we maybe dont need the OBD<>VRes junction table anymore 
                .collect(),
            output.into(),
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
    pub async fn init(_state: &State, workflow: DbWorkflow, _config: AlpacaKycConfig) -> ApiResult<Self> {
        Ok(AlpacaKycPendingReview {
            sv_id: workflow.scoped_vault_id.clone(),
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
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<AlpacaKycState> {
        let (decision, actor) = async_res;
        save_review_decision(conn, wf, decision, actor)?;
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
    pub async fn init(state: &State, workflow: DbWorkflow, _: AlpacaKycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(AlpacaKycDocCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
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
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _async_res: Self::AsyncRes,
        _conn: &mut db::TxnPgConn,
    ) -> ApiResult<AlpacaKycState> {
        Ok(AlpacaKycState::from(AlpacaKycWatchlistCheck {
            wf_id: self.wf_id,
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

    let wl_hit = [
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

#[cfg(test)]
#[allow(clippy::type_complexity)]
mod tests {
    use super::*;
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
}
