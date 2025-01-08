use super::AdhocVendorCallState;
use crate::decision::features;
use crate::decision::onboarding::RulesOutcome;
use crate::decision::risk;
use crate::decision::state::actions::MakeVendorCalls;
use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::common;
use crate::decision::state::OnAction;
use crate::decision::state::WorkflowState;
use crate::State;
use api_errors::FpResult;
use async_trait::async_trait;
use db::models::ob_configuration::VerificationChecks;
use db::models::risk_signal::RiskSignal;
use db::models::risk_signal_group::RiskSignalGroupScope;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow as DbWorkflow;
use idv::sentilink::application_risk::response::ValidatedApplicationRiskResponse;
use newtypes::AdhocVendorCallConfig;
use newtypes::DataLifetimeSeqno;
use newtypes::Locked;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::VendorAPI;
use newtypes::VerificationCheckKind;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;

#[derive(Clone)]

pub struct AdhocVendorCallVendorCalls {
    sv_id: ScopedVaultId,
    wf_id: WorkflowId,
    config: AdhocVendorCallConfig,
}

impl AdhocVendorCallVendorCalls {
    pub fn init(_state: &State, workflow: DbWorkflow, config: AdhocVendorCallConfig) -> FpResult<Self> {
        Ok(AdhocVendorCallVendorCalls {
            sv_id: workflow.scoped_vault_id,
            wf_id: workflow.id,
            config,
        })
    }

    fn verification_checks(&self) -> VerificationChecks {
        // TODO: fix this
        VerificationChecks::new_for_test(self.config.verification_checks.clone())
    }
}

/////////////////////
/// MakeVendorCalls
/// ////////////////
#[async_trait]
impl OnAction<MakeVendorCalls, AdhocVendorCallState> for AdhocVendorCallVendorCalls {
    type AsyncRes = Box<Option<(ValidatedApplicationRiskResponse, VerificationResultId)>>;

    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        state: &State,
    ) -> FpResult<Self::AsyncRes> {
        let svid = self.sv_id.clone();
        let sv = state.db_query(move |conn| ScopedVault::get(conn, &svid)).await?;
        let verification_checks = self.verification_checks();

        // Proof of concept for senti
        let sentilink_result = if verification_checks.is_enabled(VerificationCheckKind::Sentilink) {
            common::run_application_risk(state, &self.wf_id, &sv.tenant_id).await?
        } else {
            None
        };

        Ok(Box::new(sentilink_result))
    }

    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> FpResult<AdhocVendorCallState> {
        let sentilink_result = *async_res;
        // For all reason codes, we scope them to the onboarding/wf
        let risk_signal_group_scope = RiskSignalGroupScope::WorkflowId {
            id: &wf.id,
            sv_id: &wf.scoped_vault_id,
        };
        if let Some((sentilink_res, vres_id)) = sentilink_result {
            let vendor_api: VendorAPI = VendorAPI::SentilinkApplicationRisk;
            let sentilink_frc = features::sentilink::footprint_reason_codes(&sentilink_res)
                .into_iter()
                .map(|frc| (frc, vendor_api, vres_id.clone()))
                .collect();
            RiskSignal::bulk_save_for_scope(
                conn,
                risk_signal_group_scope,
                sentilink_frc,
                RiskSignalGroupKind::Synthetic,
                false,
            )?;
        }

        risk::save_final_decision(conn, &wf.id, RulesOutcome::RulesNotExecuted, None, vec![])?;
        Ok(AdhocVendorCallState::Complete(AdhocVendorCallComplete))
    }
}


#[derive(Clone)]
pub struct AdhocVendorCallComplete;

/////////////////////
/// Complete
/// ////////////////
impl AdhocVendorCallComplete {
    pub fn init(_state: &State, _workflow: DbWorkflow, _config: AdhocVendorCallConfig) -> FpResult<Self> {
        Ok(AdhocVendorCallComplete)
    }
}

impl WorkflowState for AdhocVendorCallVendorCalls {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::AdhocVendorCall(newtypes::AdhocVendorCallState::VendorCalls)
    }

    fn default_action(&self, seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls { seqno }))
    }
}


impl WorkflowState for AdhocVendorCallComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::AdhocVendorCall(newtypes::AdhocVendorCallState::Complete)
    }

    fn default_action(&self, _seqno: DataLifetimeSeqno) -> Option<WorkflowActions> {
        None
    }
}
