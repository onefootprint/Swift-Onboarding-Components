use std::sync::Arc;

use super::{
    KybAwaitingAsyncVendors, KybAwaitingBoKyc, KybComplete, KybDataCollection, KybDecisioning, KybState,
    KybVendorCalls,
};
use crate::{
    decision::{
        self,
        onboarding::{
            rules::evaluate_kyb_rules, FinalAndAdditionalDecisions, KybOnboardingRulesDecisionOutput,
            OnboardingRulesDecision, OnboardingRulesDecisionOutput,
        },
        state::{
            actions::{Authorize, WorkflowActions},
            common, AsyncVendorCallsCompleted, BoKycCompleted, MakeDecision, MakeVendorCalls, OnAction,
            WorkflowState,
        },
        utils::FixtureDecision,
        RuleError,
    },
    errors::ApiResult,
    State,
};
use async_trait::async_trait;
use db::models::{
    ob_configuration::ObConfiguration,
    onboarding_decision::OnboardingDecision,
    scoped_vault::ScopedVault,
    vault::Vault,
    workflow::{Workflow as DbWorkflow, WorkflowUpdate},
};
use feature_flag::FeatureFlagClient;
use itertools::Itertools;
use newtypes::{KybConfig, Locked, OnboardingStatus};

/////////////////////
/// DataCollection
/// ////////////////
/// Starting state that indicates we are waiting for all business information to be entered + authorized
impl KybDataCollection {
    #[tracing::instrument("KybDataCollection::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
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
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("KybDataCollection#OnAction<Authorize, KybState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        _async_res: (),
        _conn: &mut db::TxnPgConn,
    ) -> ApiResult<KybState> {
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
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KybAwaitingBoKyc {
            wf_id: workflow.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<BoKycCompleted, KybState> for KybAwaitingBoKyc {
    type AsyncRes = ();

    #[tracing::instrument(
        "KybAwaitingBoKyc#OnAction<BoKycCompleted, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: BoKycCompleted,
        _state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        Ok(())
    }

    #[tracing::instrument("KybAwaitingBoKyc#OnAction<BoKycCompleted, KybState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        _async_res: (),
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<KybState> {
        let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

        if obc.skip_kyb {
            // Handling skip_kyb flow
            // Since we're not running KYB, let's set the sv status to None
            ScopedVault::clear_business_status(conn, &wf.id)?;
            Ok(KybState::from(KybComplete {}))
        } else {
            let update = WorkflowUpdate::set_status(OnboardingStatus::Pending);
            DbWorkflow::update(wf, conn, update)?;
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
/// In this state we initiate our asyncronous Middesk state machine. In the future we may also add syncronous KYB vendors here (eg: Lexis + Experian)
impl KybVendorCalls {
    #[tracing::instrument("KybVendorCalls::init", skip_all)]
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KybVendorCalls {
            wf_id: workflow.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeVendorCalls, KybState> for KybVendorCalls {
    type AsyncRes = Option<FixtureDecision>;

    #[tracing::instrument(
        "KybVendorCalls#OnAction<MakeVendorCalls, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeVendorCalls,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let wf_id = self.wf_id.clone();
        let (wf, v) = state
            .db_pool
            .db_query(move |conn| DbWorkflow::get_with_vault(conn, &wf_id))
            .await?;
        let fixture_decision = decision::utils::get_fixture_data_decision(
            state.feature_flag_client.clone(),
            &v,
            &wf,
            &self.t_id,
        )?;
        if fixture_decision.is_none() {
            // TODO: later will refactor so we instead construct the BusinessData from the vault here, then make the CreateBusiness request to middesk
            // and then in the on_commit txn save the vreq + vres + MiddeskRequest with the business_id from the response all at once.

            // TODO: make this get_or_create
            let middesk_state =
                decision::vendor::middesk::init_middesk_request(&state.db_pool, self.wf_id.clone()).await?;

            // TODO: match on MiddeskStates and only call this if AwaitingBusinessUpdateWebhook
            let _middesk_state = middesk_state
                .make_create_business_call(
                    &state.db_pool,
                    &state.config,
                    &state.enclave_client,
                    state.feature_flag_client.clone(),
                    state.vendor_clients.middesk_create_business.clone(),
                    &self.t_id,
                )
                .await?;
        }

        Ok(fixture_decision)
    }

    #[tracing::instrument("KybVendorCalls#OnAction<MakeVendorCalls, KybState>::on_commit", skip_all)]
    fn on_commit(
        self,
        _wf: Locked<DbWorkflow>,
        fixture_decision: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<KybState> {
        if let Some(fixture_decision) = fixture_decision {
            decision::utils::write_kyb_fixture_vendor_result_and_risk_signals(
                conn,
                &self.wf_id,
                fixture_decision,
            )?;
            Ok(KybState::from(KybDecisioning {
                wf_id: self.wf_id,
                t_id: self.t_id,
            }))
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
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
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
    ) -> ApiResult<Self::AsyncRes> {
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
    ) -> ApiResult<KybState> {
        Ok(KybState::from(KybDecisioning {
            wf_id: self.wf_id,
            t_id: self.t_id,
        }))
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
    pub async fn init(state: &State, workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
        let sv = common::get_sv_for_workflow(&state.db_pool, &workflow).await?;

        Ok(KybDecisioning {
            wf_id: workflow.id,
            t_id: sv.tenant_id,
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision, KybState> for KybDecisioning {
    type AsyncRes = (Arc<dyn FeatureFlagClient>, Vec<OnboardingDecision>);

    #[tracing::instrument(
        "KybDecisioning#OnAction<MakeDecision, KybState>::execute_async_idempotent_actions",
        skip_all
    )]
    async fn execute_async_idempotent_actions(
        &self,
        _action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let bo_obds =
            decision::biz_risk::get_bo_obds(&state.db_pool, &state.enclave_client, &self.wf_id).await?;
        Ok((state.feature_flag_client.clone(), bo_obds))
    }

    #[tracing::instrument("KybDecisioning#OnAction<MakeDecision, KybState>::on_commit", skip_all)]
    fn on_commit(
        self,
        wf: Locked<DbWorkflow>,
        async_res: Self::AsyncRes,
        conn: &mut db::TxnPgConn,
    ) -> ApiResult<KybState> {
        let (ff_client, bo_obds) = async_res;
        let v = Vault::get(conn, &wf.scoped_vault_id)?;
        let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &v, &wf, &self.t_id)?;

        let sv = ScopedVault::get(conn, &self.wf_id)?;
        let rsfd = decision::features::risk_signals::fetch_latest_risk_signals_map(conn, &sv.id)?;
        let kyb_rsg = rsfd
            .kyb
            .ok_or(RuleError::MissingInputForKYBRules)
            .map_err(crate::decision::Error::from)?;

        let vres_ids = kyb_rsg
            .footprint_reason_codes
            .iter()
            .map(|(_, _, vres_id)| vres_id.clone())
            .unique()
            .collect();

        let decision = if let Some(fixture_decision) = fixture_decision {
            OnboardingRulesDecision::Kyb(KybOnboardingRulesDecisionOutput::new(
                OnboardingRulesDecisionOutput::from(fixture_decision),
            ))
        } else {
            evaluate_kyb_rules(kyb_rsg, bo_obds)?
        };

        common::save_kyc_decision(
            conn,
            &sv.id,
            &wf,
            vres_ids,
            decision.final_decision_and_additional_evaluated()?.decision,
            vec![],
        )?;

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
    pub async fn init(_state: &State, _workflow: DbWorkflow, _config: KybConfig) -> ApiResult<Self> {
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
