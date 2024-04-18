use std::{collections::HashMap, sync::Arc};

use async_trait::async_trait;
use db::{
    models::{
        data_lifetime::DataLifetime,
        document_request::{DocumentRequest, NewDocumentRequestArgs},
        ob_configuration::ObConfiguration,
        onboarding_decision::NewDecisionArgs,
        scoped_vault::ScopedVault,
        user_timeline::UserTimeline,
        vault::Vault,
        workflow::{Workflow as DbWorkflow, WorkflowUpdate as DbWorkflowUpdate},
    },
    TxnPgConn,
};

use feature_flag::FeatureFlagClient;
use newtypes::{
    DataLifetimeSeqno, DbActor, DecisionStatus, DocumentConfig, DocumentRequestConfig, DocumentRequestKind,
    Locked, OnboardingStatus, ReviewReason, RuleAction, RuleSetResultKind, ScopedVaultId, StepUpInfo,
    TenantId, WorkflowConfig, WorkflowId,
};

use super::{DocumentState, MakeDecision};
use crate::{
    decision::{
        self,
        features::risk_signals::fetch_latest_risk_signals_map,
        rule_engine::engine::VaultDataForRules,
        state::{
            actions::{DocCollected, WorkflowActions},
            common, OnAction, WorkflowState,
        },
        utils::should_execute_rules_for_document_only,
        vendor::{tenant_vendor_control::TenantVendorControl, vendor_result::VendorResult},
    },
    errors::{ApiResult, AssertionError},
    State,
};

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

        let non_identity_document_request = match &wf.config {
            WorkflowConfig::Document(c) => {
                if !c.kind.is_identity() {
                    Some(c.kind)
                } else {
                    None
                }
            }
            _ => None,
        };
        let current_seqno = DataLifetime::get_current_seqno(conn)?;

        if let Some(doc_req) = non_identity_document_request {
            handle_non_identity_document(conn, wf, Some(current_seqno), doc_req)?;
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
            let (rule_set_result, decision) = common::evaluate_rules(
                conn,
                risk_signals,
                &VaultDataForRules::empty(), // TODO
                &HashMap::new(),             // TODO mb
                &wf,
                fixture_decision.is_some(),
                RuleSetResultKind::WorkflowDecision,
            )?;
            let decision = if let Some(fixture_decision) = fixture_decision {
                if execute_rules_for_real_document_decision_only || obc.skip_kyc {
                    decision
                } else {
                    common::kyc_decision_from_fixture(fixture_decision)?
                }
            } else {
                decision
            };
            let vres_ids = vendor_results
                .into_iter()
                .map(|vr| vr.verification_result_id)
                .collect();

            match decision.decision_status {
                DecisionStatus::Fail | DecisionStatus::Pass => {
                    common::save_kyc_decision(
                        conn,
                        &self.sv_id,
                        &wf,
                        vres_ids,
                        decision,
                        Some(&rule_set_result.id),
                        vec![],
                    )?;
                    Ok(DocumentState::from(DocumentComplete))
                }
                DecisionStatus::StepUp => {
                    let doc_reqs = if let Some(RuleAction::StepUp(kind)) = decision.action {
                        kind.to_doc_kinds()
                            .into_iter()
                            .filter_map(|kind| match kind {
                                DocumentRequestKind::Identity => Some(DocumentRequestConfig::Identity {
                                    collect_selfie: true, // TODO: should come from config
                                }),
                                DocumentRequestKind::ProofOfAddress => {
                                    Some(DocumentRequestConfig::ProofOfAddress {})
                                }
                                DocumentRequestKind::ProofOfSsn => Some(DocumentRequestConfig::ProofOfSsn {}),
                                DocumentRequestKind::Custom => None,
                            })
                            .map(|config| NewDocumentRequestArgs {
                                scoped_vault_id: self.sv_id.clone(),
                                workflow_id: self.wf_id.clone(),
                                rule_set_result_id: Some(rule_set_result.id.clone()),
                                config,
                            })
                            .collect()
                    } else {
                        vec![]
                    };
                    let doc_reqs = DocumentRequest::bulk_create(conn, doc_reqs)?;
                    let stepup_info = StepUpInfo {
                        document_request_ids: doc_reqs.into_iter().map(|dr| dr.id).collect(),
                    };
                    UserTimeline::create(conn, stepup_info, v.id.clone(), self.sv_id.clone())?;

                    let update = DbWorkflowUpdate::set_status(OnboardingStatus::Incomplete);
                    DbWorkflow::update(wf, conn, update)?;

                    Ok(DocumentState::from(DocumentDataCollection {
                        wf_id: self.wf_id,
                        sv_id: self.sv_id,
                        t_id: self.t_id,
                    }))
                }
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

#[tracing::instrument(skip_all)]
fn handle_non_identity_document(
    conn: &mut TxnPgConn,
    wf: Locked<DbWorkflow>,
    seqno: Option<DataLifetimeSeqno>,
    doc_request_kind: DocumentRequestKind,
) -> ApiResult<()> {
    let sv = ScopedVault::lock(conn, &wf.scoped_vault_id)?;
    let review_reasons = match doc_request_kind {
        DocumentRequestKind::Identity => None,
        DocumentRequestKind::ProofOfSsn => Some(vec![ReviewReason::ProofOfSsnDocument]),
        DocumentRequestKind::ProofOfAddress => Some(vec![ReviewReason::ProofOfAddressDocument]),
        DocumentRequestKind::Custom => Some(vec![ReviewReason::CustomDocument]),
    };
    let decision = NewDecisionArgs {
        vault_id: sv.vault_id.clone(),
        logic_git_hash: crate::GIT_HASH.to_string(),
        status: from_scoped_vault_status_for_non_identity_document_decision(&sv)?,
        result_ids: vec![],
        annotation_id: None,
        actor: DbActor::Footprint,
        seqno,
        create_manual_review_reasons: review_reasons,
        rule_set_result_id: None,
    };
    let update = DbWorkflowUpdate::set_decision(&wf, decision);
    // TODO: figure out a strategy for users already in MR to push the fact that there's a MR for SSN Upload now
    DbWorkflow::update(wf, conn, update)?;

    Ok(())
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
