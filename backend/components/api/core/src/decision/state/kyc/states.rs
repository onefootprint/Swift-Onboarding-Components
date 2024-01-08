use std::sync::Arc;

use async_trait::async_trait;
use db::models::{
    document_request::{DocumentRequest, NewDocumentRequestArgs},
    ob_configuration::ObConfiguration,
    risk_signal::{NewRiskSignalInfo, RiskSignal},
    risk_signal_group::RiskSignalGroup,
    vault::Vault,
    workflow::{Workflow as DbWorkflow, WorkflowUpdate},
};

use feature_flag::FeatureFlagClient;
use idv::incode::watchlist::response::WatchlistResultResponse;
use newtypes::{
    DecisionStatus, DocumentRequestKind, EnhancedAmlOption, KycConfig, Locked, OnboardingStatus,
    RiskSignalGroupKind, VerificationResultId,
};

use super::{
    KycComplete, KycDataCollection, KycDecisioning, KycDocCollection, KycState, KycVendorCalls, MakeDecision,
    MakeVendorCalls,
};
use crate::decision::{
    features::risk_signals::{
        fetch_latest_risk_signals_map, parse_reason_codes_from_vendor_result,
        risk_signal_group_struct::{Aml, Kyc},
        save_risk_signals, RiskSignalGroupStruct,
    },
    state::{
        actions::{Authorize, WorkflowActions},
        common::{self},
        DocCollected, WorkflowState,
    },
    utils::should_execute_rules_for_document_only,
};
use crate::{
    decision::{self, state::OnAction, vendor::vendor_result::VendorResult},
    errors::ApiResult,
    State,
};

// TODO: how do we want to model sandbox here 🤔? Could (1) do entirely seperatly from workflow, (2) special case it within workflow, (3) model it as an immediate transition from DataCollection -> Complete
// (2) is probs the best, I can imagine someone like Follow wanting to test the full workflow in sandbox

/////////////////////
/// DataCollection
/// ////////////////
impl KycDataCollection {
    #[tracing::instrument("KycDataCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDataCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<Authorize, KycState> for KycDataCollection {
    type AsyncRes = ();

    #[tracing::instrument("OnAction<Authorize, KycState>::execute_async_idempotent_actions", skip_all)]
    async fn execute_async_idempotent_actions(
        &self,
        _action: Authorize,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // Write fingerprints
        common::write_authorized_fingerprints(state, &self.wf_id).await?;

        Ok(())
    }

    #[tracing::instrument("OnAction<Authorize, KycState>::on_commit", skip_all)]
    fn on_commit(self, wf: Locked<DbWorkflow>, _: (), conn: &mut db::TxnPgConn) -> ApiResult<KycState> {
        DbWorkflow::update(wf, conn, WorkflowUpdate::set_status(OnboardingStatus::Pending))?;

        Ok(KycState::from(KycVendorCalls {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for KycDataCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::DataCollection)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// VendorCalls
/// ////////////////
impl KycVendorCalls {
    #[tracing::instrument("KycVendorCalls::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycVendorCalls {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, KycState> for KycVendorCalls {
    type AsyncRes = (
        Option<Vec<NewRiskSignalInfo>>,
        Option<VendorResult>,
        Option<(VerificationResultId, WatchlistResultResponse)>,
        Arc<dyn FeatureFlagClient>,
    );

    #[tracing::instrument(
        "OnAction<MakeVendorCalls, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let wfid = self.wf_id.clone();
        let obc = state
            .db_pool
            .db_query(move |conn| ObConfiguration::get(conn, &wfid))
            .await??
            .0;

        // TODO: we should also skip if the UVW is non-US, but then we probably need to assert that doc was collected. Also need to clairfy tenant's understanding of this
        let kyc_vendor_result = if !obc.skip_kyc {
            Some(common::run_kyc_vendor_calls(state, &self.wf_id, &self.t_id).await?)
        } else {
            None
        };

        let aml_vendor_result = match obc.enhanced_aml {
            EnhancedAmlOption::No => None,
            EnhancedAmlOption::Yes { .. } => {
                Some(common::run_aml_call(state, &self.wf_id, &self.t_id).await?)
            }
        };

        let ocr_reason_codes =
            common::maybe_generate_ocr_reason_codes(state, &self.wf_id, &self.sv_id).await?;

        Ok((
            ocr_reason_codes,
            kyc_vendor_result,
            aml_vendor_result,
            state.feature_flag_client.clone(),
        ))
    }

    #[tracing::instrument("OnAction<MakeVendorCalls, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<KycState> {
        let (ocr_reason_codes, kyc_vendor_result, aml_vendor_result, ff_client) = async_res;
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
        // Save KYC risk signals, if we made KYC calls
        if let Some(kyc_vendor_result) = &kyc_vendor_result {
            let kyc_risk_signals = if let Some(fd) = fixture_decision {
                let reason_codes = decision::sandbox::get_fixture_kyc_reason_codes(fd, &vw, &obc);
                let vres_id = kyc_vendor_result.verification_result_id.clone();

                RiskSignalGroupStruct {
                    footprint_reason_codes: reason_codes
                        .into_iter()
                        .map(|r| (r.0, r.1, vres_id.clone()))
                        .collect(),
                    group: Kyc,
                }
            } else {
                parse_reason_codes_from_vendor_result(kyc_vendor_result.clone(), vw.clone(), obc.clone())?.kyc
                // TODO: only call this once and re-use for aml portion below
            };
            save_risk_signals(conn, &self.sv_id, &kyc_risk_signals, false)?;
        }

        // Save AML risk signals from Aml call or Kyc call (or save nothing if neither called)
        if let Some((watchlist_vres_id, watchlist_result_response)) = aml_vendor_result {
            let aml_risk_signals = if let Some(fixture_decision) = fixture_decision {
                let reason_codes = decision::sandbox::get_fixture_aml_reason_codes(&fixture_decision, &obc);

                RiskSignalGroupStruct {
                    footprint_reason_codes: reason_codes
                        .into_iter()
                        .map(|r| (r.0, r.1, watchlist_vres_id.clone()))
                        .collect(),
                    group: Aml,
                }
            } else {
                common::get_aml_risk_signals_from_aml_call(
                    &obc,
                    &watchlist_vres_id,
                    &watchlist_result_response,
                )
            };
            save_risk_signals(conn, &self.sv_id, &aml_risk_signals, false)?;
        } else if let Some(kyc_vendor_result) = kyc_vendor_result {
            let aml_risk_signals = common::get_aml_risk_signals_from_kyc_call(obc, vw, kyc_vendor_result)?;
            save_risk_signals(conn, &self.sv_id, &aml_risk_signals, false)?;
        };

        Ok(KycState::from(KycDecisioning {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for KycVendorCalls {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::VendorCalls)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls))
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl KycDecisioning {
    #[tracing::instrument("KycDecisioning::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDecisioning {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision, KycState> for KycDecisioning {
    type AsyncRes = Arc<dyn FeatureFlagClient>;

    #[tracing::instrument(
        "OnAction<MakeDecision, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(state.feature_flag_client.clone())
    }

    #[tracing::instrument("OnAction<MakeDecision, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<KycState> {
        let ff_client = async_res;
        let v = Vault::get(conn, &wf.scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

        let fixture_decision =
            decision::utils::get_fixture_data_decision(ff_client.clone(), &v, &wf, &self.t_id)?;
        let execute_rules_for_real_document_decision_only = should_execute_rules_for_document_only(&v, &wf)?;
        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;

        let doc_collected = DocumentRequest::get_identity(conn, &wf.id)?.is_some();
        let review_reasons = common::get_review_reasons(&risk_signals, doc_collected, &obc);
        let vres_ids = risk_signals.verification_result_ids();

        // Always execute real Rules, even in sandbox. But below we just use the sandbox fixture decision instead of the decision from these real Rules
        let decision = common::get_decision(conn, risk_signals, &wf, fixture_decision.is_some())?;
        // If Sandbox and not doing real decisioning using doc, then replace decision with the fixture decision
        let decision = if let Some(fixture_decision) = fixture_decision {
            if execute_rules_for_real_document_decision_only || obc.skip_kyc {
                decision
            } else {
                let doc_collected = DocumentRequest::get_identity(conn, &wf.id)?.is_some();
                // we'll hopefully support fixturing the post-stepup decision but for now we just always fail with review if we stepped up
                let fixture_decision =
                    if matches!(fixture_decision.0, DecisionStatus::StepUp) && doc_collected {
                        (DecisionStatus::Fail, true)
                    } else {
                        fixture_decision
                    };
                common::kyc_decision_from_fixture(fixture_decision)?
            }
        } else {
            decision
        };

        match decision.decision_status {
            DecisionStatus::Fail | DecisionStatus::Pass => {
                common::save_kyc_decision(conn, &self.sv_id, &wf, vres_ids, decision, review_reasons)?;
                Ok(KycState::from(KycComplete))
            }
            DecisionStatus::StepUp => {
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

                Ok(KycState::from(KycDocCollection {
                    wf_id: self.wf_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                }))
            }
        }
    }
}

impl WorkflowState for KycDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::Decisioning)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision))
    }
}

/////////////////////
/// Complete
/// ////////////////
impl KycComplete {
    #[tracing::instrument("KycComplete::init", skip_all)]
    pub async fn init(_state: &State, _workflow: DbWorkflow, _config: KycConfig) -> ApiResult<Self> {
        Ok(KycComplete)
    }
}

impl WorkflowState for KycComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::Complete)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// DocCollection
/// ////////////////
impl KycDocCollection {
    #[tracing::instrument("AlpacaKycDocCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDocCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<DocCollected, KycState> for KycDocCollection {
    type AsyncRes = ();

    #[tracing::instrument(
        "OnAction<DocCollected, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: DocCollected,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("OnAction<DocCollected, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _async_res: Self::AsyncRes,
        _conn: &mut db::TxnPgConn,
    ) -> ApiResult<KycState> {
        Ok(KycState::from(KycDecisioning {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for KycDocCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KycState::DocCollection)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None // have to wait for doc collection flow to finish
    }
}
