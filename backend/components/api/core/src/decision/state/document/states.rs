use super::{DocumentState, MakeDecision};
use crate::{
    decision::{
        self,
        features::risk_signals::fetch_latest_risk_signals_map,
        onboarding::Decision,
        rule_engine::{
            self,
            engine::{EvaluateWorkflowDecisionArgs, VaultDataForRules},
        },
        state::{
            actions::{DocCollected, WorkflowActions},
            common::{self, DecisionOutput},
            OnAction, WorkflowState,
        },
        utils::should_execute_rules_for_document_only,
        vendor::{tenant_vendor_control::TenantVendorControl, vendor_result::VendorResult},
    },
    errors::{ApiResult, AssertionError},
    State,
};
use async_trait::async_trait;
use db::models::{
    data_lifetime::DataLifetime,
    manual_review::{ManualReviewAction, ManualReviewArgs},
    ob_configuration::ObConfiguration,
    onboarding_decision::NewDecisionArgs,
    scoped_vault::ScopedVault,
    vault::Vault,
    workflow::{Workflow as DbWorkflow, WorkflowUpdate as DbWorkflowUpdate},
};
use feature_flag::FeatureFlagClient;
use itertools::Itertools;
use newtypes::{
    DbActor, DecisionStatus, DocumentConfig, DocumentRequestConfig, Locked, ManualReviewKind,
    OnboardingStatus, ReviewReason, RuleSetResultKind, ScopedVaultId, TenantId, WorkflowConfig, WorkflowId,
};
use std::{collections::HashMap, sync::Arc};

///
/// States
///

#[derive(Clone)]
pub struct DocumentDataCollection {
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct DocumentDecisioning {
    #[allow(unused)]
    wf_id: WorkflowId,
    sv_id: ScopedVaultId,
    t_id: TenantId,
}

#[derive(Clone)]
pub struct DocumentComplete;

/////////////////////
/// DataCollection
/// ////////////////
impl DocumentDataCollection {
    #[tracing::instrument("DocumentDataCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: DocumentConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(DocumentDataCollection {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
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
        _action: DocCollected,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let tid = self.t_id.clone();
        let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.config, &state.enclave_client).await?;

        Ok(tvc)
    }

    #[tracing::instrument("OnAction<DocCollected, DocumentState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _tvc: TenantVendorControl,
        _conn: &mut db::TxnPgConn,
    ) -> ApiResult<DocumentState> {
        Ok(DocumentState::from(DocumentDecisioning {
            wf_id: self.wf_id,
            sv_id: self.sv_id,
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
    pub async fn init(state: &State, workflow: DbWorkflow, _config: DocumentConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(DocumentDecisioning {
            wf_id: workflow.id,
            sv_id: workflow.scoped_vault_id.clone(),
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision, DocumentState> for DocumentDecisioning {
    type AsyncRes = (Arc<dyn FeatureFlagClient>, Vec<VendorResult>);

    #[tracing::instrument(
        "OnAction<MakeDecision, DocumentState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let vendor_results = common::get_latest_vendor_results(state, &self.sv_id).await?;

        Ok((state.feature_flag_client.clone(), vendor_results))
    }

    #[tracing::instrument("OnAction<MakeDecision, DocumentState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<DocumentState> {
        let (ff_client, vendor_results) = async_res;

        // TODO move this logic to make a DocumentNeedsReview manual review into common::save_decision
        // so the KYC (and probably KYB) workflow can also use it
        let review_reasons = match &wf.config {
            WorkflowConfig::Document(c) => c
                .configs
                .iter()
                .filter_map(|c| match c {
                    DocumentRequestConfig::Identity { .. } => None,
                    DocumentRequestConfig::ProofOfSsn {} => Some(ReviewReason::ProofOfSsnDocument),
                    DocumentRequestConfig::ProofOfAddress {} => Some(ReviewReason::ProofOfAddressDocument),
                    DocumentRequestConfig::Custom { .. } => Some(ReviewReason::CustomDocument),
                })
                .collect_vec(),
            _ => vec![],
        };
        let current_seqno = DataLifetime::get_current_seqno(conn)?;

        if !review_reasons.is_empty() {
            // We short circuit for document workflows that have non-identity documents. Since we
            // don't verify them, we need a human to manually review them.
            // We'll create a manual review without evaluating rules

            // TODO don't need to lock
            let sv = ScopedVault::lock(conn, &wf.scoped_vault_id)?;
            let manual_review = ManualReviewArgs {
                kind: ManualReviewKind::DocumentNeedsReview,
                action: ManualReviewAction::GetOrCreate { review_reasons },
            };
            let decision = NewDecisionArgs {
                vault_id: sv.vault_id.clone(),
                logic_git_hash: crate::GIT_HASH.to_string(),
                status: from_scoped_vault_status_for_non_identity_document_decision(&sv)?,
                result_ids: vec![],
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno: current_seqno,
                manual_reviews: vec![manual_review],
                rule_set_result_id: None,
            };
            let update = DbWorkflowUpdate::set_decision(&wf, decision);
            // TODO: figure out a strategy for users already in MR to push the fact that there's a MR for SSN Upload now
            DbWorkflow::update(wf, conn, update)?;
            Ok(DocumentState::from(DocumentComplete))
        } else {
            let v = Vault::get(conn, &wf.scoped_vault_id)?;
            let (obc, _) = ObConfiguration::get(conn, &wf.id)?;
            // Rerun decisioning, but with the latest doc risk signals
            let fixture_decision =
                decision::utils::get_fixture_data_decision(ff_client.clone(), &v, &wf, &self.t_id)?;
            let execute_rules_for_real_document_decision_only =
                should_execute_rules_for_document_only(&v, &wf)?;
            let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;
            // TODO: what's the review strategy for this case?
            let args = EvaluateWorkflowDecisionArgs {
                sv_id: &wf.scoped_vault_id,
                obc_id: &obc.id,
                wf_id: &wf.id,
                kind: RuleSetResultKind::WorkflowDecision,
                risk_signals: risk_signals.risk_signals,
                vault_data: &VaultDataForRules::empty(), // TODO
                lists: &HashMap::new(),                  // TODO mb
                is_fixture: fixture_decision.is_some(),
            };
            let (decision, rsr_id) = rule_engine::engine::evaluate_workflow_decision(conn, args)?;

            let decision = if let Some(fixture_decision) = fixture_decision {
                if execute_rules_for_real_document_decision_only || obc.skip_kyc {
                    decision
                } else {
                    Decision::from(fixture_decision)
                }
            } else {
                decision
            };
            let vres_ids = vendor_results
                .into_iter()
                .map(|vr| vr.verification_result_id)
                .collect();

            let output = common::handle_rules_output(conn, wf, v.id, vres_ids, decision, rsr_id, vec![])?;
            match output {
                DecisionOutput::Terminal => Ok(DocumentState::from(DocumentComplete)),
                DecisionOutput::NonTerminal => Ok(DocumentState::from(DocumentDataCollection {
                    wf_id: self.wf_id,
                    sv_id: self.sv_id,
                    t_id: self.t_id,
                })),
            }
        }
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
    pub async fn init(_state: &State, _workflow: DbWorkflow, _config: DocumentConfig) -> ApiResult<Self> {
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

// in order to avoid updating sv status or triggering a status changed updated webhook,
// we map the current sv.status to whatever the DecisionStatus should be to maintain that status
fn from_scoped_vault_status_for_non_identity_document_decision(
    scoped_vault: &ScopedVault,
) -> ApiResult<DecisionStatus> {
    let sv_status = scoped_vault.status.ok_or(AssertionError(
        "cannot determine proof of ssn decision from sv.status",
    ))?;
    match sv_status {
        OnboardingStatus::Pass => Ok(DecisionStatus::Pass),
        OnboardingStatus::Fail => Ok(DecisionStatus::Fail),
        OnboardingStatus::Incomplete | OnboardingStatus::Pending => {
            Err(AssertionError("scoped vault status must be in pass or fail to collect proof of ssn").into())
        }
    }
}
