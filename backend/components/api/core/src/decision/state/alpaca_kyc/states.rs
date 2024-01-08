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
    AlpacaKycConfig, DecisionIntentKind, DecisionStatus, DocumentRequestKind, Locked, OnboardingStatus,
    RiskSignalGroupKind, VendorAPI,
};

use crate::{
    auth::tenant::AuthActor,
    decision::{
        self,
        features::risk_signals::{
            fetch_latest_kyc_risk_signals, parse_reason_codes_from_vendor_result,
            risk_signal_group_struct::{self},
            save_risk_signals, RiskSignalGroupStruct,
        },
        onboarding::Decision,
        review::save_review_decision,
        state::{
            actions::{MakeDecision, WorkflowActions},
            common::{self},
            Authorize, DocCollected, MakeVendorCalls, MakeWatchlistCheckCall, OnAction, ReviewCompleted,
            WorkflowState,
        },
        utils::FixtureDecision,
        vendor::{
            self, incode_watchlist::WatchlistCheckKind, tenant_vendor_control::TenantVendorControl,
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
        VendorResult,
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
        let vendor_result = common::run_kyc_vendor_calls(state, &self.wf_id, &self.t_id).await?;
        let ocr_reason_codes =
            common::maybe_generate_ocr_reason_codes(state, &self.wf_id, &self.sv_id).await?;

        Ok((ocr_reason_codes, vendor_result, state.feature_flag_client.clone()))
    }

    #[tracing::instrument("OnAction<MakeVendorCalls, AlpacaKycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<AlpacaKycState> {
        let (ocr_reason_codes, vendor_result, ff_client) = async_res;
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
                let vres_id = vendor_result.verification_result_id.clone();

                RiskSignalGroupStruct {
                    footprint_reason_codes: reason_codes
                        .into_iter()
                        .map(|r| (r.0, r.1, vres_id.clone()))
                        .collect(),
                    group: risk_signal_group_struct::Kyc,
                }
            } else {
                parse_reason_codes_from_vendor_result(vendor_result.clone(), vw, obc)?.kyc
            };

        save_risk_signals(conn, &self.sv_id, &risk_signals, false)?;

        // we might need doc signals here too, so we reload
        let risk_signals = fetch_latest_kyc_risk_signals(conn, &self.sv_id)?;

        Ok(AlpacaKycState::from(AlpacaKycDecisioning {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
            vendor_results: vec![vendor_result],
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
            .db_query(move |conn| fetch_latest_kyc_risk_signals(conn, &svid))
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
        let fixture_decision =
            decision::utils::get_fixture_data_decision(ff_client.clone(), &v, &wf, &self.t_id)?;
        // TODO: reason_codes are produced in `MakeVendorCalls` on_commit, so untangle this from the util
        // TODO: load risk signals here, and use that to evaluate the rules
        let decision =
            common::get_decision(conn, self.risk_signals.clone(), &wf, fixture_decision.is_some())?;
        let decision = if let Some(fixture_decision) = fixture_decision {
            common::alpaca_kyc_decision_from_fixture(fixture_decision)?
        } else {
            decision
        };

        match decision.decision_status {
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
                    decision,
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
                    kind: DocumentRequestKind::Identity,
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
        let fixture_decision =
            decision::utils::get_fixture_data_decision(ff_client.clone(), &v, &wf, &self.t_id)?;

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
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

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
            Either::Right((vres, fixture_decision)) => {
                decision::sandbox::get_fixture_aml_reason_codes(fixture_decision, &obc)
                    .into_iter()
                    .map(|(r, v)| (r, v, vres.id.clone()))
                    .collect()
            }
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

        // If we collected a doc, we go to review and fail OBD even if no hits
        let doc_req = DocumentRequest::get_identity(conn, &self.wf_id)?;

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
                should_commit: !is_sandbox, // To be consistent with the Kyc workflow which currently does not commit data if the decision is Fail
                create_manual_review: true,
            }
        };
        let review_reasons = common::get_review_reasons_inner(
            &wc_reason_codes.iter().map(|r| r.0.clone()).collect::<Vec<_>>(),
            doc_req.is_some(),
        );

        common::save_kyc_decision(
            conn,
            &self.sv_id,
            &wf,
            vendor_results
                .iter()
                .map(|vr| vr.verification_result_id.clone()) // TODO: a little funky- we maybe dont need the OBD<>VRes junction table anymore 
                .collect(),
            final_decision.clone(),
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
