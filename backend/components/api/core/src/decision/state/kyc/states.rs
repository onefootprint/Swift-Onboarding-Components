use std::sync::Arc;

use async_trait::async_trait;
use db::models::{
    decision_intent::DecisionIntent,
    onboarding::{Onboarding, OnboardingUpdate},
    scoped_vault::ScopedVault,
    workflow::Workflow,
};
use feature_flag::{FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use newtypes::{FootprintReasonCode, KycConfig, VaultKind, Vendor, VerificationResultId, WorkflowKind};

use super::{Complete, DataCollection, Decisioning, MakeDecision, MakeVendorCalls, States, VendorCalls};
use crate::decision::{
    onboarding::{FeatureVector, OnboardingRulesDecisionOutput},
    state::{actions::Authorize, common},
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
            wf_id: workflow.id,
            is_redo: config.is_redo,
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

    fn on_commit(self, tvc: TenantVendorControl, conn: &mut db::TxnPgConn) -> ApiResult<States> {
        common::setup_kyc_onboarding_vreqs(conn, tvc, self.is_redo, &self.ob_id, &self.sv_id)?;

        Ok(VendorCalls {
            wf_id: self.wf_id,
            is_redo: self.is_redo,
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
    pub async fn init(state: &State, workflow: Workflow, config: KycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(VendorCalls {
            wf_id: workflow.id,
            is_redo: config.is_redo,
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

    fn on_commit(self, vendor_results: Vec<VendorResult>, _conn: &mut db::TxnPgConn) -> ApiResult<States> {
        Ok(Decisioning {
            wf_id: self.wf_id,
            is_redo: self.is_redo,
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
    pub async fn init(state: &State, workflow: Workflow, config: KycConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        let vendor_results = common::assert_kyc_vendor_calls_completed(state, &ob.id, &sv.id).await?;

        Ok(Decisioning {
            wf_id: workflow.id,
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
impl OnAction<MakeDecision, States> for Decisioning {
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

    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<States> {
        let (fixture_decision, ff_client) = async_res;

        let (decision, reason_codes) = if let Some(fixture_decision) = fixture_decision {
            common::kyc_decision_from_fixture(fixture_decision)
        } else {
            common::get_kyc_decision(conn, self.vendor_results.clone())?
        };

        common::save_kyc_decision(
            conn,
            &self.ob_id,
            &self.wf_id,
            self.vendor_results
                .iter()
                .map(|vr| vr.verification_result_id.clone())
                .collect(),
            &(decision, reason_codes),
            self.is_redo,
            fixture_decision.is_some(),
        )?;
        Ok(Complete.into())
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
