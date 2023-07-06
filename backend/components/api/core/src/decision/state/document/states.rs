use std::sync::Arc;

use async_trait::async_trait;
use db::models::{
    decision_intent::DecisionIntent,
    onboarding::{Onboarding, OnboardingUpdate},
    scoped_vault::ScopedVault,
    vault::Vault,
    workflow::Workflow as DbWorkflow,
};
use feature_flag::{FeatureFlagClient, LaunchDarklyFeatureFlagClient};
use newtypes::{DocumentConfig, FootprintReasonCode, VaultKind, Vendor, VerificationResultId};
use newtypes::{OnboardingId, ScopedVaultId, TenantId, WorkflowId};
use webhooks::WebhookClient;

use super::{DocumentState, MakeDecision};
use crate::decision::{
    onboarding::{FeatureVector, KycRuleGroup, OnboardingRulesDecisionOutput, RuleGroup},
    rule::rule_sets,
    state::{
        actions::{DocCollected, WorkflowActions},
        common,
        traits::HasRuleGroup,
        WorkflowState,
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

impl HasRuleGroup for DocumentDecisioning {
    // TODO: change this to document rules
    fn rule_group(&self) -> RuleGroup {
        RuleGroup::Kyc(KycRuleGroup {
            idology_rules: rule_sets::kyc::idology_rule_set(),
            experian_rules: rule_sets::kyc::experian_rule_set(),
        })
    }
}

#[derive(Clone)]
pub struct DocumentComplete;

/////////////////////
/// DataCollection
/// ////////////////
impl DocumentDataCollection {
    #[tracing::instrument("DocumentDataCollection::init", skip_all)]
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

    #[tracing::instrument(
        "OnAction<DocCollected, DocumentState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        action: DocCollected,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let svid = self.sv_id.clone();
        let tid = self.t_id.clone();
        let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.config).await?;

        Ok(tvc)
    }

    #[tracing::instrument("OnAction<DocCollected, DocumentState>::on_commit", skip_all)]
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
    #[tracing::instrument("DocumentDecisioning::init", skip_all)]
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
        Arc<dyn FeatureFlagClient>,
        Vec<VendorResult>,
        Arc<dyn WebhookClient>,
    );

    #[tracing::instrument(
        "OnAction<MakeDecision, DocumentState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        // TODO
        let vendor_results =
            common::assert_kyc_vendor_calls_completed(state, &self.ob_id, &self.sv_id).await?;

        Ok((
            state.feature_flag_client.clone(),
            vendor_results,
            state.webhook_client.clone(),
        ))
    }

    #[tracing::instrument("OnAction<MakeDecision, DocumentState>::on_commit", skip_all)]
    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<DocumentState> {
        let (ff_client, vendor_results, webhook_client) = async_res;
        let vault = Vault::get(conn, &self.sv_id)?;
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &vault, &self.t_id)?;

        let (decision, reason_codes) = if let Some(fixture_decision) = fixture_decision {
            common::kyc_decision_from_fixture(fixture_decision, &vendor_results)?
        } else {
            common::get_decision(&self, conn, &vendor_results)?
        };

        // TODO: doc wf shouldn't really be calling this
        common::save_kyc_decision(
            conn,
            webhook_client,
            &self.ob_id,
            &self.sv_id,
            &self.wf_id,
            vendor_results
                .into_iter()
                .map(|vr| vr.verification_result_id)
                .collect(),
            decision,
            true,
            fixture_decision.is_some(),
            vec![],
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
    #[tracing::instrument("DocumentComplete::init", skip_all)]
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
