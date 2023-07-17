use std::sync::Arc;

use async_trait::async_trait;
use db::models::{
    risk_signal::RiskSignal, risk_signal_group::RiskSignalGroup, vault::Vault,
    workflow::Workflow as DbWorkflow,
};

use feature_flag::FeatureFlagClient;
use newtypes::{KycConfig, RiskSignalGroupKind, VaultKind};
use webhooks::WebhookClient;

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
    vendor::vendor_api::vendor_api_response::build_vendor_response_map_from_vendor_results,
};
use crate::{
    decision::{
        self,
        state::OnAction,
        vendor::{tenant_vendor_control::TenantVendorControl, vendor_result::VendorResult},
    },
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
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycDataCollection {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            sv_id: sv.id,
            ob_id: ob.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<Authorize, KycState> for KycDataCollection {
    type AsyncRes = TenantVendorControl;

    #[tracing::instrument("OnAction<Authorize, KycState>::execute_async_idempotent_actions", skip_all)]
    async fn execute_async_idempotent_actions(
        &self,
        _action: Authorize,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // Write fingerprints
        common::write_authorized_fingerprints(state, &self.sv_id).await?;

        // Create TVC for use in writing vreqs in `on_commit`
        let tid = self.t_id.clone();
        let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.config).await?;

        Ok(tvc)
    }

    #[tracing::instrument("OnAction<Authorize, KycState>::on_commit", skip_all)]
    fn on_commit(self, tvc: TenantVendorControl, conn: &mut db::TxnPgConn) -> ApiResult<KycState> {
        common::setup_kyc_onboarding_vreqs(conn, tvc, self.is_redo, &self.ob_id, &self.sv_id)?;

        Ok(KycState::from(KycVendorCalls {
            wf_id: self.wf_id,
            is_redo: self.is_redo,
            sv_id: self.sv_id,
            ob_id: self.ob_id,
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
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KycVendorCalls {
            wf_id: workflow.id,
            is_redo: config.is_redo,
            sv_id: sv.id,
            ob_id: ob.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, KycState> for KycVendorCalls {
    type AsyncRes = (Vec<VendorResult>, Arc<dyn FeatureFlagClient>);

    #[tracing::instrument(
        "OnAction<MakeVendorCalls, KycState>::execute_async_idempotent_actions",
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

    #[tracing::instrument("OnAction<MakeVendorCalls, KycState>::on_commit", skip_all)]
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<KycState> {
        let (vendor_results, ff_client) = async_res;
        let vault = Vault::get(conn, &self.sv_id)?;
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &vault, &self.t_id)?;
        let risk_signals: RiskSignalGroupStruct<risk_signal_group_struct::Kyc> =
            if let Some(fd) = fixture_decision {
                let reason_codes = decision::sandbox::get_fixture_reason_codes(fd, VaultKind::Person);
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

        Ok(KycState::from(KycDecisioning {
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
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        let vendor_results = common::assert_kyc_vendor_calls_completed(state, &ob.id, &sv.id).await?;

        let svid = sv.id.clone();
        let risk_signals = state
            .db_pool
            .db_query(move |conn| fetch_latest_risk_signals_map(conn, &svid))
            .await??;

        Ok(KycDecisioning {
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
impl OnAction<MakeDecision, KycState> for KycDecisioning {
    type AsyncRes = (Arc<dyn FeatureFlagClient>, Arc<dyn WebhookClient>);

    #[tracing::instrument(
        "OnAction<MakeDecision, KycState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok((state.feature_flag_client.clone(), state.webhook_client.clone()))
    }

    #[tracing::instrument("OnAction<MakeDecision, KycState>::on_commit", skip_all)]
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<KycState> {
        let (ff_client, webhook_client) = async_res;
        let vault = Vault::get(conn, &self.sv_id)?;
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &vault, &self.t_id)?;

        // TODO: reason_codes are produced in `MakeVendorCalls` on_commit, so untangle this from the util
        let decision = if let Some(fixture_decision) = fixture_decision {
            common::kyc_decision_from_fixture(fixture_decision)?
        } else {
            common::get_decision(&self, conn, self.risk_signals.clone(), &self.sv_id)?
        };

        // Now, we unhide the risk signals for the vendor that made the decision
        let rsg = RiskSignalGroup::latest_by_kind(conn.conn(), &self.sv_id, RiskSignalGroupKind::Kyc)?;
        RiskSignal::unhide_risk_signals_for_risk_signal_group(
            conn,
            &rsg.id,
            vec![decision.output.decision.vendor_api],
        )?;

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
