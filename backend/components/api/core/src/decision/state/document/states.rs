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
        vendor::tenant_vendor_control::TenantVendorControl,
    },
    errors::ApiResult,
    State,
};
use async_trait::async_trait;
use db::models::{
    ob_configuration::ObConfiguration, rule_instance::IncludeRules, vault::Vault,
    workflow::Workflow as DbWorkflow,
};
use feature_flag::FeatureFlagClient;
use newtypes::{
    DocumentConfig, Locked, RuleInstanceKind, RuleSetResultKind, ScopedVaultId, TenantId, WorkflowId,
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
    type AsyncRes = Arc<dyn FeatureFlagClient>;

    #[tracing::instrument(
        "OnAction<MakeDecision, DocumentState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(state.feature_flag_client.clone())
    }

    #[tracing::instrument("OnAction<MakeDecision, DocumentState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<DocumentState> {
        let ff_client = async_res;
        let v = Vault::get(conn, &wf.scoped_vault_id)?;
        // Note: in a document workflow, this is generally the last playbook you onboarded onto.
        // So, we will run rules from the last playbook
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

        // Rerun decisioning, but with the latest doc risk signals
        let fixture_decision =
            decision::utils::get_fixture_data_decision(ff_client.clone(), &v, &wf, &self.t_id)?;
        let execute_rules_for_real_document_decision_only = should_execute_rules_for_document_only(&v, &wf)?;
        let risk_signals = fetch_latest_risk_signals_map(conn, &self.sv_id)?;
        let vres_ids = risk_signals.verification_result_ids();

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
            include_rules: IncludeRules::Kind(RuleInstanceKind::Person), // TODO: change when maybe we have rules based on biz docs?
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
