use std::sync::Arc;

use async_trait::async_trait;
use db::models::{
    decision_intent::DecisionIntent,
    onboarding::{Onboarding, OnboardingUpdate},
    scoped_vault::ScopedVault,
    workflow::Workflow,
};
use feature_flag::{FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use newtypes::{FootprintReasonCode, KycConfig, VaultKind, Vendor, VerificationResultId};

use super::{Complete, DataCollection, Decisioning, MakeDecision, MakeVendorCalls, States, VendorCalls};
use crate::decision::{
    onboarding::{FeatureVector, OnboardingRulesDecisionOutput},
    state::{actions::Authorize, common, WorkflowStates},
    utils::FixtureDecision,
};
use crate::{
    decision::{
        self, engine,
        state::{OnAction, StateError},
        vendor::{tenant_vendor_control::TenantVendorControl, vendor_result::VendorResult},
    },
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::{Person, VaultWrapper, VwArgs},
    ApiError, State,
};

// TODO: how do we want to model sandbox here 🤔? Could (1) do entirely seperatly from workflow, (2) special case it within workflow, (3) model it as an immediate transition from DataCollection -> Complete
// (2) is probs the best, I can imagine someone like Follow wanting to test the full workflow in sandbox

/////////////////////
/// DataCollection
/// ////////////////
impl DataCollection {
    pub async fn init(state: &State, workflow: Workflow, config: KycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(DataCollection {
            is_redo: config.is_redo,
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

    fn on_commit(self, tvc: TenantVendorControl, conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        common::setup_kyc_onboarding_vreqs(conn, tvc, self.is_redo, &self.ob_id, &self.sv_id)?;

        Ok(States::from(VendorCalls {
            is_redo: self.is_redo,
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
    pub async fn init(state: &State, workflow: Workflow, config: KycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(VendorCalls {
            is_redo: config.is_redo,
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
        _conn: &mut db::TxnPgConn,
    ) -> ApiResult<WorkflowStates> {
        Ok(States::from(Decisioning {
            is_redo: self.is_redo,
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
    pub async fn init(state: &State, workflow: Workflow, config: KycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        let vendor_results = common::assert_kyc_vendor_calls_completed(state, &ob.id, &sv.id).await?;

        Ok(Decisioning {
            is_redo: config.is_redo,
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
            vendor_results,
        })
    }
}

type IsSandbox = bool;
#[async_trait]
impl OnAction<MakeDecision> for Decisioning {
    type AsyncRes = (Option<FixtureDecision>, Arc<dyn FeatureFlagClient>);

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

        Ok((fixture_decision, state.feature_flag_client.clone()))
    }

    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        let (fixture_decision, ff_client) = async_res;
        let verification_result_ids = self
            .vendor_results
            .iter()
            .map(|vr| vr.verification_result_id.clone())
            .collect();

        // If we are Sandbox/Demo, we use the predefined decision output and generate random reason codes. Else we run our rules engine for realsies
        let (rules_output, reason_codes, is_sandbox) = if let Some(fixture_decision) = fixture_decision {
            let rules_output = OnboardingRulesDecisionOutput::from(fixture_decision);
            let reason_codes =
                decision::sandbox::get_fixture_reason_codes(fixture_decision, VaultKind::Person);
            (rules_output, reason_codes, true)
        } else {
            let (rules_output, fv) = decision::engine::calculate_decision(self.vendor_results.clone())?;

            // TODO: refactor DE code so we *only* do the FF call here but do calculate_decision and the reason_code creation within on_commit
            let reason_codes = engine::reason_codes_for_tenant(ff_client, &self.t_id, &fv)?;
            (rules_output, reason_codes, false)
        };

        let (ob, _, _, _) = Onboarding::get(conn, &self.ob_id)?;
        engine::save_onboarding_decision(
            conn,
            &ob,
            rules_output,
            reason_codes,
            verification_result_ids,
            !self.is_redo, // TODO: refactor this completely and just don't update or assert an Onboarding stuff is is_redo. later, remove Onboarding compeltely
            is_sandbox,
        )?;
        Ok(States::from(Complete).into())
    }
}

/////////////////////
/// Complete
/// ////////////////
impl Complete {
    pub async fn init(_state: &State, workflow: Workflow, config: KycConfig) -> ApiResult<Self> {
        Ok(Complete)
    }
}
