use super::AdhocVendorCallState;
use crate::decision;
use crate::decision::features;
use crate::decision::features::risk_signals::parse_reason_codes_from_vendor_result;
use crate::decision::onboarding::RulesOutcome;
use crate::decision::risk;
use crate::decision::state::actions::MakeVendorCalls;
use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::common;
use crate::decision::state::OnAction;
use crate::decision::state::WorkflowState;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::State;
use api_errors::FpResult;
use async_trait::async_trait;
use db::models::ob_configuration::VerificationChecks;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::risk_signal::RiskSignal;
use db::models::risk_signal_group::RiskSignalGroupScope;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow as DbWorkflow;
use feature_flag::FeatureFlagClient;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::sentilink::application_risk::response::ValidatedApplicationRiskResponse;
use newtypes::AdhocVendorCallConfig;
use newtypes::DataLifetimeSeqno;
use newtypes::EnhancedAmlOption;
use newtypes::Locked;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::VendorAPI;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;
use std::sync::Arc;
use twilio::response::lookup::LookupV2Response;

#[derive(Clone)]

pub struct AdhocVendorCallVendorCalls {
    sv_id: ScopedVaultId,
    wf_id: WorkflowId,
    config: AdhocVendorCallConfig,
    t_id: TenantId,
    seqno: DataLifetimeSeqno,
}

impl AdhocVendorCallVendorCalls {
    pub async fn init(
        state: &State,
        workflow: DbWorkflow,
        config: AdhocVendorCallConfig,
        seqno: DataLifetimeSeqno,
    ) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;
        Ok(AdhocVendorCallVendorCalls {
            sv_id: workflow.scoped_vault_id,
            wf_id: workflow.id,
            config,
            t_id: sv.tenant_id,
            seqno,
        })
    }

    fn verification_checks(&self) -> VerificationChecks {
        VerificationChecks::new(self.config.verification_checks.clone())
    }
}


type UserInputRiskSignals = Vec<NewRiskSignalInfo>;
type KycResult = VendorResult;
type AmlResult = (VerificationResultId, WatchlistResultResponse);
/////////////////////
/// MakeVendorCalls
/// ////////////////
#[async_trait]
impl OnAction<MakeVendorCalls, AdhocVendorCallState> for AdhocVendorCallVendorCalls {
    type AsyncRes = Box<(
        Arc<dyn FeatureFlagClient>,
        Option<(ValidatedApplicationRiskResponse, VerificationResultId)>,
        Option<(LookupV2Response, VerificationResultId)>,
        UserInputRiskSignals,
        Option<KycResult>,
        Option<AmlResult>,
    )>;

    async fn execute_async_idempotent_actions(
        &self,
        action: MakeVendorCalls,
        state: &State,
    ) -> FpResult<Self::AsyncRes> {
        let svid = self.sv_id.clone();
        let wfid = self.wf_id.clone();
        let (vw, sv, obc) = state
            .db_query(move |conn| {
                // For KYC/KYB, it doesn't really matter what OBC we choose, we're just running KYC/KYB and
                // not executing rules
                let (vw, _, obc) = common::get_vw_and_obc(conn, &svid, action.seqno, &wfid)?;
                let sv = ScopedVault::get(conn, &svid)?;

                Ok((vw, sv, obc))
            })
            .await?;
        let verification_checks = self.verification_checks();

        // Proof of concept for senti
        let sentilink_result = if verification_checks.is_enabled(VerificationCheckKind::Sentilink) {
            common::run_application_risk(state, &self.wf_id, &sv.tenant_id).await?
        } else {
            None
        };

        let twilio_result = if let Some(VerificationCheck::Phone { attributes }) =
            verification_checks.get(VerificationCheckKind::Phone)
        {
            common::run_twilio_check(state, &self.wf_id, &attributes).await?
        } else {
            None
        };

        let (kyc_vendor_result, user_input_risk_signals) = if verification_checks
            .is_enabled(VerificationCheckKind::Kyc)
        {
            let kyc_vendor_result = common::run_kyc_vendor_calls(state, &self.wf_id, &sv.tenant_id).await?;
            let user_input_risk_signals = features::user_input::generate_user_input_risk_signals(
                &state.enclave_client,
                &vw,
                &obc,
                kyc_vendor_result.vendor_api(),
                &kyc_vendor_result.verification_result_id,
            )
            .await?;
            (Some(kyc_vendor_result), user_input_risk_signals)
        } else {
            (None, vec![])
        };

        let aml_vendor_result = match verification_checks.enhanced_aml() {
            EnhancedAmlOption::No => None,
            EnhancedAmlOption::Yes { .. } => {
                Some(common::run_aml_call(state, &self.wf_id, &self.t_id).await?)
            }
        };

        Ok(Box::new((
            state.ff_client.clone(),
            sentilink_result,
            twilio_result,
            user_input_risk_signals,
            kyc_vendor_result,
            aml_vendor_result,
        )))
    }

    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> FpResult<AdhocVendorCallState> {
        let (
            ff_client,
            sentilink_result,
            twilio_result,
            user_input_risk_signals,
            kyc_vendor_result,
            aml_vendor_result,
        ) = *async_res;
        let (vw, _, obc) = common::get_vw_and_obc(conn, &self.sv_id, self.seqno, &self.wf_id)?;
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
                risk_signal_group_scope.clone(),
                sentilink_frc,
                RiskSignalGroupKind::Synthetic,
                false,
            )?;
        }

        if let Some((twilio_res, vres_id)) = twilio_result {
            // TODO: cleaning this up in separate stack
            // https://linear.app/footprint/issue/BE-365/remove-parsedresponse
            let vendor_api: VendorAPI = VendorAPI::TwilioLookupV2;
            let twilio_frc = features::twilio::footprint_reason_codes(&twilio_res)
                .into_iter()
                .map(|frc| (frc, vendor_api, vres_id.clone()))
                .collect();

            RiskSignal::bulk_save_for_scope(
                conn,
                risk_signal_group_scope.clone(),
                twilio_frc,
                RiskSignalGroupKind::Phone,
                false,
            )?;
        }

        let fixture_result = decision::utils::get_fixture_result(ff_client, &vw.vault, &wf, &self.t_id)?;
        // Save KYC risk signals, if we made KYC calls
        if let Some(kyc_vendor_result) = &kyc_vendor_result {
            let kyc_risk_signals = if let Some(fd) = fixture_result {
                let reason_codes = decision::sandbox::get_fixture_kyc_reason_codes(fd, &obc);
                let vres_id = kyc_vendor_result.verification_result_id.clone();

                reason_codes
                    .into_iter()
                    .map(|r| (r.0, r.1, vres_id.clone()))
                    .collect()
            } else {
                parse_reason_codes_from_vendor_result(kyc_vendor_result.clone(), &vw)?.kyc
            };

            let rses = kyc_risk_signals
                .into_iter()
                .chain(user_input_risk_signals)
                .collect();
            RiskSignal::bulk_save_for_scope(
                conn,
                risk_signal_group_scope.clone(),
                rses,
                RiskSignalGroupKind::Kyc,
                false,
            )?;
        }
        // Save AML risk signals from Aml call or Kyc call (or save nothing if neither called)
        if let Some((watchlist_vres_id, watchlist_result_response)) = aml_vendor_result {
            let aml_risk_signals = if let Some(fixture_result) = fixture_result {
                let reason_codes = decision::sandbox::get_fixture_aml_reason_codes(&fixture_result, &obc);

                reason_codes
                    .into_iter()
                    .map(|r| (r.0, r.1, watchlist_vres_id.clone()))
                    .collect()
            } else {
                common::get_aml_risk_signals_from_aml_call(
                    &obc,
                    &watchlist_vres_id,
                    &watchlist_result_response,
                )
            };
            RiskSignal::bulk_save_for_scope(
                conn,
                risk_signal_group_scope.clone(),
                aml_risk_signals,
                RiskSignalGroupKind::Aml,
                false,
            )?;
        } else if let Some(kyc_vendor_result) = kyc_vendor_result {
            let aml_risk_signals = common::get_aml_risk_signals_from_kyc_call(&vw, kyc_vendor_result)?;
            RiskSignal::bulk_save_for_scope(
                conn,
                risk_signal_group_scope.clone(),
                aml_risk_signals,
                RiskSignalGroupKind::Aml,
                false,
            )?;
        };

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
