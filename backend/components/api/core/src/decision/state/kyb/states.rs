use super::KybAwaitingAsyncVendors;
use super::KybAwaitingBoKyc;
use super::KybComplete;
use super::KybDataCollection;
use super::KybDecisioning;
use super::KybState;
use super::KybVendorCalls;
use crate::decision::onboarding::Decision;
use crate::decision::risk;
use crate::decision::rule_engine::engine::VaultDataForRules;
use crate::decision::rule_engine::eval::RuleEvalConfig;
use crate::decision::state::actions::Authorize;
use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::common;
use crate::decision::state::AsyncVendorCallsCompleted;
use crate::decision::state::BoKycCompleted;
use crate::decision::state::MakeDecision;
use crate::decision::state::MakeVendorCalls;
use crate::decision::state::OnAction;
use crate::decision::state::WorkflowState;
use crate::decision::{
    self,
};
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use async_trait::async_trait;
use db::models::data_lifetime::DataLifetime;
use db::models::insight_event::InsightEvent;
use db::models::list_entry::ListEntry;
use db::models::list_entry::ListWithDecryptedEntries;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::RiskSignal;
use db::models::risk_signal_group::RiskSignalGroup;
use db::models::rule_instance::RuleInstance;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::workflow::Workflow as DbWorkflow;
use feature_flag::FeatureFlagClient;
use itertools::Itertools;
use newtypes::DecisionStatus;
use newtypes::FootprintReasonCode;
use newtypes::KybConfig;
use newtypes::ListId;
use newtypes::Locked;
use newtypes::OnboardingStatus;
use newtypes::RiskSignalGroupKind;
use newtypes::RuleSetResultKind;
use newtypes::WorkflowFixtureResult;
use std::collections::HashMap;
use std::sync::Arc;

/////////////////////
/// DataCollection
/// ////////////////
/// Starting state that indicates we are waiting for all business information to be entered +
/// authorized
impl KybDataCollection {
    #[tracing::instrument("KybDataCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KybDataCollection {
            wf_id: workflow.id,
            t_id: sv.tenant_id,
            sv_id: workflow.scoped_vault_id.clone(),
        })
    }
}

#[async_trait]
impl OnAction<Authorize, KybState> for KybDataCollection {
    type AsyncRes = ();

    #[tracing::instrument(
        "KybDataCollection#OnAction<Authorize, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: Authorize,
        _state: &State,
    ) -> FpResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("KybDataCollection#OnAction<Authorize, KybState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _async_res: (),
        _conn: &mut db::TxnPgConn,
    ) -> FpResult<KybState> {
        Ok(KybState::from(KybAwaitingBoKyc {
            wf_id: self.wf_id,
            t_id: self.t_id,
        }))
    }
}

impl WorkflowState for KybDataCollection {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::DataCollection)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// AwaitingBoKyc
/// ////////////////
/// After all business information is collected, we wait in this state for all BO's to complete KYC
impl KybAwaitingBoKyc {
    #[tracing::instrument("KybAwaitingBoKyc::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KybAwaitingBoKyc {
            wf_id: workflow.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<BoKycCompleted, KybState> for KybAwaitingBoKyc {
    type AsyncRes = Vec<OnboardingDecision>;

    #[tracing::instrument(
        "KybAwaitingBoKyc#OnAction<BoKycCompleted, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: BoKycCompleted,
        state: &State,
    ) -> FpResult<Self::AsyncRes> {
        let bo_obds = decision::biz_risk::get_bo_obds(state, &self.wf_id).await?;
        Ok(bo_obds)
    }

    #[tracing::instrument("KybAwaitingBoKyc#OnAction<BoKycCompleted, KybState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> FpResult<KybState> {
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;
        let bo_obds = async_res;
        if bo_obds.iter().any(|o| o.status == DecisionStatus::Fail) {
            // Add risk signal for BO failing KYC
            // TODO: one of these days we need to drop the non-null vres constraint
            if let Some(bo_risk_signal) = bo_obds
                .first()
                .and_then(|obd| DbWorkflow::get(conn, &obd.workflow_id).ok())
                .and_then(|wf| {
                    RiskSignal::latest_by_risk_signal_group_kind(
                        conn,
                        &wf.scoped_vault_id,
                        RiskSignalGroupKind::Kyc,
                    )
                    .ok()
                })
                .and_then(|mut rs| rs.pop())
            {
                let bo_rs = (
                    FootprintReasonCode::BeneficialOwnerFailedKyc,
                    bo_risk_signal.vendor_api,
                    bo_risk_signal.verification_result_id.clone(),
                );

                let rsg =
                    RiskSignalGroup::get_or_create(conn, &wf.scoped_vault_id, RiskSignalGroupKind::Kyb)?;
                RiskSignal::bulk_add(conn, vec![bo_rs], false, rsg.id)?;
            };
        }

        if obc.skip_kyb {
            // Skip past KYB vendor calls and go straight to decisioning
            Ok(KybState::from(KybDecisioning::new(self.wf_id, self.t_id)))
        } else {
            DbWorkflow::update_status(wf, conn, OnboardingStatus::Pending)?;
            Ok(KybState::from(KybVendorCalls {
                wf_id: self.wf_id,
                t_id: self.t_id,
            }))
        }
    }
}

impl WorkflowState for KybAwaitingBoKyc {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::AwaitingBoKyc)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// VendorCalls
/// ////////////////
/// In this state we initiate our asyncronous Middesk state machine. In the future we may also add
/// syncronous KYB vendors here (eg: Lexis + Experian)
impl KybVendorCalls {
    #[tracing::instrument("KybVendorCalls::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KybVendorCalls {
            wf_id: workflow.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, KybState> for KybVendorCalls {
    type AsyncRes = Option<WorkflowFixtureResult>;

    #[tracing::instrument(
        "KybVendorCalls#OnAction<MakeVendorCalls, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        state: &State,
    ) -> FpResult<Self::AsyncRes> {
        let wf_id = self.wf_id.clone();
        let (wf, v) = state
            .db_pool
            .db_query(move |conn| DbWorkflow::get_with_vault(conn, &wf_id))
            .await?;
        let fixture_result =
            decision::utils::get_fixture_result(state.ff_client.clone(), &v, &wf, &self.t_id)?;
        if fixture_result.is_none() {
            // TODO: later will refactor so we instead construct the BusinessData from the vault here, then
            // make the CreateBusiness request to middesk and then in the on_commit txn save the
            // vreq + vres + MiddeskRequest with the business_id from the response all at once.

            // TODO: make this get_or_create
            let middesk_state =
                decision::vendor::middesk::init_middesk_request(&state.db_pool, self.wf_id.clone()).await?;

            // TODO: match on MiddeskStates and only call this if AwaitingBusinessUpdateWebhook
            let _middesk_state = middesk_state.make_create_business_call(state, &self.t_id).await?;
        }

        Ok(fixture_result)
    }

    #[tracing::instrument("KybVendorCalls#OnAction<MakeVendorCalls, KybState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        fixture_result: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> FpResult<KybState> {
        if let Some(fixture_result) = fixture_result {
            decision::utils::write_kyb_fixture_vendor_result_and_risk_signals(
                conn,
                &self.wf_id,
                fixture_result,
            )?;
            Ok(KybState::from(KybDecisioning::new(self.wf_id, self.t_id)))
        } else {
            Ok(KybState::from(KybAwaitingAsyncVendors {
                wf_id: self.wf_id,
                t_id: self.t_id,
            }))
        }
    }
}

impl WorkflowState for KybVendorCalls {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::VendorCalls)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeVendorCalls(MakeVendorCalls))
    }
}

/////////////////////
/// AwaitingAsyncVendors
/// ////////////////
/// We remain in this state until the Middesk asyncronous flow completes.
impl KybAwaitingAsyncVendors {
    #[tracing::instrument("KybAwaitingAsyncVendors::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KybAwaitingAsyncVendors {
            wf_id: workflow.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<AsyncVendorCallsCompleted, KybState> for KybAwaitingAsyncVendors {
    type AsyncRes = ();

    #[tracing::instrument(
        "KybAwaitingAsyncVendors#OnAction<AsyncVendorCallsCompleted, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: AsyncVendorCallsCompleted,
        _state: &State,
    ) -> FpResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument(
        "KybAwaitingAsyncVendors#OnAction<AsyncVendorCallsCompleted, KybState>::on_commit",
        skip_all
    )]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _async_res: (),
        _conn: &mut db::TxnPgConn,
    ) -> FpResult<KybState> {
        Ok(KybState::from(KybDecisioning::new(self.wf_id, self.t_id)))
    }
}

impl WorkflowState for KybAwaitingAsyncVendors {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::AwaitingAsyncVendors)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl KybDecisioning {
    #[tracing::instrument("KybDecisioning::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> FpResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KybDecisioning::new(workflow.id, sv.tenant_id))
    }
}

#[async_trait]
impl OnAction<MakeDecision, KybState> for KybDecisioning {
    type AsyncRes = (
        Arc<dyn FeatureFlagClient>,
        VaultDataForRules,
        HashMap<ListId, ListWithDecryptedEntries>,
    );

    #[tracing::instrument(
        "KybDecisioning#OnAction<MakeDecision, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> FpResult<Self::AsyncRes> {
        let wfid = self.wf_id.clone();
        let rule_kind = self.include_rules;
        let (tenant, rules, vw, lists) = state
            .db_pool
            .db_query(move |conn| -> FpResult<_> {
                let wf = DbWorkflow::get(conn, &wfid)?;
                let (obc, tenant) = ObConfiguration::get(conn, &wfid)?;
                let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, &obc.id, rule_kind)?;

                let seqno = DataLifetime::get_current_seqno(conn)?; // TODO: should technically pass this seqno to RuleSetResult to store in pg instead of pulling
                                                                    // a new seqno inside the RSR write itself
                let vw =
                    VaultWrapper::<Any>::build_for_tenant_version(conn, &wf.scoped_vault_id, Some(seqno))?;

                let lists = ListEntry::list_bulk(conn, &common::list_ids_from_rules(&rules))?;

                Ok((tenant, rules, vw, lists))
            })
            .await?;

        let rule_exprs = rules.iter().map(|r| &r.rule_expression).collect_vec();
        let vault_data_for_rules = VaultDataForRules::decrypt_for_rules(state, vw, &rule_exprs).await?;
        let lists_for_rules = common::saturate_list_entries(state, &tenant, lists).await?;
        Ok((state.ff_client.clone(), vault_data_for_rules, lists_for_rules))
    }

    #[tracing::instrument("KybDecisioning#OnAction<MakeDecision, KybState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> FpResult<KybState> {
        let (ff_client, vault_data_for_rules, lists_for_rules) = async_res;
        let v = Vault::get(conn, &wf.scoped_vault_id)?;
        let fixture_result = decision::utils::get_fixture_result(ff_client, &v, &wf, &self.t_id)?;
        let obc = ObConfiguration::get(conn, &self.wf_id)?.0;

        let sv = ScopedVault::get(conn, &self.wf_id)?;
        let rsfd = decision::features::risk_signals::fetch_latest_risk_signals_map(conn, &sv.id)?;
        let kyb_rsg = rsfd.kyb.unwrap_or_default();

        let vres_ids = kyb_rsg
            .footprint_reason_codes
            .iter()
            .map(|(_, _, vres_id)| vres_id.clone())
            .unique()
            .collect();

        let kyb_rs: Vec<RiskSignal> = rsfd.risk_signals.into_iter().flat_map(|(_, v)| v).collect();

        // TODO: Consider pulling in additional insight events?
        let insight_events: Vec<InsightEvent> = InsightEvent::get_for_workflow(conn, &self.wf_id)?
            .into_iter()
            .collect();

        // TODO should we be using evaluate_workflow_decision?
        let (decision, rsr_id) = if let Some((rsr, _)) = decision::rule_engine::engine::evaluate_rules(
            conn,
            &sv.id,
            &obc,
            Some(&self.wf_id),
            RuleSetResultKind::WorkflowDecision,
            &kyb_rs,
            &vault_data_for_rules,
            &insight_events,
            &lists_for_rules,
            &RuleEvalConfig::default(),
            self.include_rules,
        )? {
            let decision = Decision::RulesExecuted {
                should_commit: false, // never commit business data for now
                create_manual_review: rsr
                    .action_triggered
                    .map(|r| r.should_create_review())
                    .unwrap_or(false),
                action: rsr.action_triggered,
            };
            (decision, Some(rsr.id))
        } else {
            (Decision::RulesNotExecuted, None)
        };

        let decision = if let Some(fixture_result) = fixture_result {
            if obc.skip_kyb {
                // In skip KYB, we want to take the evaluated "NoRulesExecuted" rather than the fixture
                // decision
                decision
            } else {
                Decision::from(fixture_result)
            }
        } else {
            decision
        };

        // TODO should we use common::save_decision as well in order to handle step-ups in KYB?
        // or no, because this only applies to business entities? then where are we saving the
        // decision / applying step up for the user entity?
        // or yes, but it just no-ops?
        risk::save_final_decision(conn, &wf.id, vres_ids, decision, rsr_id, vec![])?;

        Ok(KybState::from(KybComplete {}))
    }
}

impl WorkflowState for KybDecisioning {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::Decisioning)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        Some(WorkflowActions::MakeDecision(MakeDecision))
    }
}

/////////////////////
/// Complete
/// ////////////////
impl KybComplete {
    #[tracing::instrument("KybComplete::init", skip_all)]
    pub async fn init(_state: &State, _workflow: DbWorkflow, _config: KybConfig) -> FpResult<Self> {
        Ok(KybComplete {})
    }
}

impl WorkflowState for KybComplete {
    fn name(&self) -> newtypes::WorkflowState {
        newtypes::WorkflowState::from(newtypes::KybState::Complete)
    }

    fn default_action(&self) -> Option<WorkflowActions> {
        None
    }
}
