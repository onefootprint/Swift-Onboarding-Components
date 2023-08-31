use std::sync::Arc;

use async_trait::async_trait;
use db::models::{
    ob_configuration::ObConfiguration,
    risk_signal::{NewRiskSignalInfo, RiskSignal},
    risk_signal_group::RiskSignalGroup,
    vault::Vault,
    workflow::{Workflow as DbWorkflow, WorkflowUpdate},
};

use feature_flag::FeatureFlagClient;
use newtypes::{KycConfig, Locked, OnboardingStatus, RiskSignalGroupKind, VaultKind};

use super::{
    KycComplete, KycDataCollection, KycDecisioning, KycState, KycVendorCalls, MakeDecision, MakeVendorCalls,
};
use crate::decision::{
    features::risk_signals::{
        create_risk_signals_from_vendor_results, fetch_latest_risk_signals_map, risk_signal_group_struct,
        save_risk_signals, RiskSignalGroupStruct,
    },
    state::{
        actions::{Authorize, WorkflowActions},
        common::{self, get_vres_id_for_fixture},
        WorkflowState,
    },
    utils::should_execute_rules_for_document_only,
    vendor::vendor_api::vendor_api_response::build_vendor_response_map_from_vendor_results,
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
    pub async fn init(state: &State, workflow: DbWorkflow, config: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDataCollection {
            wf_id: workflow.id,
            is_redo: config.is_redo,
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
            is_redo: self.is_redo,
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
    pub async fn init(state: &State, workflow: DbWorkflow, config: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycVendorCalls {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, KycState> for KycVendorCalls {
    type AsyncRes = (
        Option<Vec<NewRiskSignalInfo>>,
        Option<Vec<VendorResult>>,
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
        let kyc_vendor_results = if !obc.skip_kyc {
            Some(common::run_kyc_vendor_calls(state, &self.wf_id, &self.t_id).await?)
        } else {
            None
        };

        let ocr_reason_codes =
            common::maybe_generate_ocr_reason_codes(state, &self.wf_id, &self.sv_id).await?;

        Ok((
            ocr_reason_codes,
            kyc_vendor_results,
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
        let (ocr_reason_codes, kyc_vendor_results, ff_client) = async_res;
        let (vw, obc) = common::get_vw_and_obc(conn, &self.sv_id, &self.wf_id)?;

        // Save OCR risk signals for doc-first OBC if necessary
        if let Some(ocr_reason_codes) = ocr_reason_codes {
            // We save under the same RSG created during the incode state machine if it ran so we
            // don't invalidate the old RSG
            let rsg = RiskSignalGroup::get_or_create(conn, &self.sv_id, RiskSignalGroupKind::Doc)?;
            RiskSignal::bulk_add(conn, ocr_reason_codes, false, rsg.id)?;
        }

        // Save KYC risk signals, if we made KYC calls
        if let Some(kyc_vendor_results) = kyc_vendor_results {
            let fixture_decision =
                decision::utils::get_fixture_data_decision(ff_client, &vw.vault, &wf, &self.t_id)?;
            let risk_signals: RiskSignalGroupStruct<risk_signal_group_struct::Kyc> = if let Some(fd) =
                fixture_decision
            {
                let reason_codes =
                    decision::sandbox::get_fixture_reason_codes(fd, VaultKind::Person, Some((&vw, &obc)));
                let vres_id = get_vres_id_for_fixture(&kyc_vendor_results)?;

                RiskSignalGroupStruct {
                    footprint_reason_codes: reason_codes
                        .into_iter()
                        .map(|r| (r.0, r.1, vres_id.clone()))
                        .collect(),
                    group: risk_signal_group_struct::Kyc,
                }
            } else {
                let vendor_result_maps = build_vendor_response_map_from_vendor_results(&kyc_vendor_results)?;
                create_risk_signals_from_vendor_results(vendor_result_maps, vw, obc)?
            };

            save_risk_signals(conn, &self.sv_id, &risk_signals, true)?;
        }

        Ok(KycState::from(KycDecisioning {
            wf_id: self.wf_id,
            is_redo: self.is_redo,
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
    pub async fn init(state: &State, workflow: DbWorkflow, config: KycConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDecisioning {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision, KycState> for KycDecisioning {
    type AsyncRes = (Vec<VendorResult>, Arc<dyn FeatureFlagClient>);

    #[tracing::instrument(
        "OnAction<MakeDecision, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // TODO: we don't really need the onboarding_decision_verification_result_junction anymore and that's the only reason we retrieve vendor results directly here
        // can probably rm
        let latest_vendor_results = common::get_latest_vendor_results(state, &self.sv_id).await?;
        Ok((latest_vendor_results, state.feature_flag_client.clone()))
    }

    #[tracing::instrument("OnAction<MakeDecision, KycState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<KycState> {
        let (latest_vendor_results, ff_client) = async_res;
        let v = Vault::get(conn, &wf.scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &v, &wf, &self.t_id)?;
        let execute_rules_for_real_document_decision_only =
            should_execute_rules_for_document_only(&v, &wf, &obc)?;
        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;

        let decision = if let Some(fixture_decision) = fixture_decision {
            if execute_rules_for_real_document_decision_only {
                common::get_decision(&self, conn, risk_signals, &wf, &v)?
            } else {
                common::kyc_decision_from_fixture(fixture_decision)?
            }
        } else {
            common::get_decision(&self, conn, risk_signals, &wf, &v)?
        };

        if let Some(chosen_kyc_vendor) = decision.chosen_kyc_vendor() {
            // Now, we unhide the risk signals for the vendor that made the decision
            let rsg = RiskSignalGroup::latest_by_kind(conn.conn(), &self.sv_id, RiskSignalGroupKind::Kyc)?;
            RiskSignal::unhide_risk_signals_for_risk_signal_group(conn, &rsg.id, chosen_kyc_vendor)?;
        }

        common::save_kyc_decision(
            conn,
            &self.sv_id,
            &wf,
            latest_vendor_results
                .iter()
                .map(|vr| vr.verification_result_id.clone())
                .collect(),
            decision.into(),
            fixture_decision.is_some(),
            vec![],
        )?;
        Ok(KycState::from(KycComplete))
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
