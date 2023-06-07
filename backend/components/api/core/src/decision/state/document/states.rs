use std::sync::Arc;

use async_trait::async_trait;
use db::models::{
    decision_intent::DecisionIntent,
    onboarding::{Onboarding, OnboardingUpdate},
    scoped_vault::ScopedVault,
    workflow::Workflow as DbWorkflow,
};
use feature_flag::{FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use newtypes::{DocumentConfig, FootprintReasonCode, VaultKind, Vendor, VerificationResultId};
use newtypes::{OnboardingId, ScopedVaultId, TenantId, WorkflowId};

use super::{DocumentState, MakeDecision};
use crate::decision::{
    onboarding::{FeatureVector, OnboardingRulesDecisionOutput},
    state::{
        actions::{DocCollected, WorkflowActions},
        common, WorkflowState,
    },
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

///
/// States
///

#[derive(Clone)]
pub struct DocumentDataCollection {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    ob_id: OnboardingId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct DocumentDecisioning {
    wf_id: WorkflowId,
    ob_id: OnboardingId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct DocumentComplete;

/////////////////////
/// DataCollection
/// ////////////////
impl DocumentDataCollection {
    pub async fn init(state: &State, workflow: DbWorkflow, config: DocumentConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(DocumentDataCollection {
            wf_id: workflow.id,
            sv_id: sv.id,
            ob_id: ob.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<DocCollected, DocumentState> for DocumentDataCollection {
    type AsyncRes = TenantVendorControl;

    async fn execute_async_idempotent_actions(
        &self,
        action: DocCollected,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let svid = self.sv_id.clone();
        let tid = self.t_id.clone();
        let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.enclave_client, &state.config).await?;

        Ok(tvc)
    }

    fn on_commit(self, tvc: TenantVendorControl, conn: &mut db::TxnPgConn) -> ApiResult<DocumentState> {
        Ok(DocumentState::from(DocumentDecisioning {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
            ob_id: self.ob_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for DocumentDataCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::DocumentState::DataCollection.into()
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl DocumentDecisioning {
    pub async fn init(state: &State, workflow: DbWorkflow, config: DocumentConfig) -> ApiResult<Self> {
        let (ob, sv) = common::get_onboarding_for_workflow(&state.db_pool, &workflow).await?;

        Ok(DocumentDecisioning {
            wf_id: workflow.id,
            ob_id: ob.id,
            sv_id: sv.id,
            t_id: sv.tenant_id,
        })
    }
}

type IsSandbox = bool;
#[async_trait]
impl OnAction<MakeDecision, DocumentState> for DocumentDecisioning {
    type AsyncRes = (
        Option<FixtureDecision>,
        Arc<dyn FeatureFlagClient>,
        Vec<VendorResult>,
    );

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

        // TODO
        let vendor_results =
            common::assert_kyc_vendor_calls_completed(state, &self.ob_id, &self.sv_id).await?;

        Ok((
            fixture_decision,
            state.feature_flag_client.clone(),
            vendor_results,
        ))
    }
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<DocumentState> {
        let (fixture_decision, ff_client, vendor_results) = async_res;

        let (decision, reason_codes) = if let Some(fixture_decision) = fixture_decision {
            common::kyc_decision_from_fixture(fixture_decision)
        } else {
            common::get_kyc_decision(conn, vendor_results.clone())?
        };

        common::save_kyc_decision(
            conn,
            &self.ob_id,
            &self.wf_id,
            vendor_results
                .into_iter()
                .map(|vr| vr.verification_result_id)
                .collect(),
            &(decision, reason_codes),
            true,
            fixture_decision.is_some(),
        )?;
        Ok(DocumentState::from(DocumentComplete))
    }
}

impl WorkflowState for DocumentDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::DocumentState::Decisioning.into()
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision))
    }
}

/////////////////////
/// Complete
/// ////////////////
impl DocumentComplete {
    pub async fn init(_state: &State, workflow: DbWorkflow, config: DocumentConfig) -> ApiResult<Self> {
        Ok(DocumentComplete)
    }
}

impl WorkflowState for DocumentComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::DocumentState::Complete.into()
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}
