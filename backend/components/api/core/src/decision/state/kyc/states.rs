use async_trait::async_trait;
use db::models::{
    decision_intent::DecisionIntent,
    onboarding::{Onboarding, OnboardingUpdate},
    scoped_vault::ScopedVault,
    workflow::Workflow,
};
use newtypes::{FootprintReasonCode, Vendor, VerificationResultId};

use super::{
    Authorize, Complete, DataCollection, Decisioning, MakeDecision, MakeVendorCalls, States, VendorCalls,
};
use crate::decision::{
    onboarding::{FeatureVector, OnboardingRulesDecisionOutput},
    state::WorkflowStates,
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
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let (ob, sv) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let sv = ScopedVault::get(conn, &workflow.scoped_vault_id)?;
                let (ob, _, _, _) = Onboarding::get(conn, (&sv.id, &sv.vault_id))?;
                Ok((ob, sv))
            })
            .await??;
        Ok(DataCollection {
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
        let ob = Onboarding::lock(conn, &self.ob_id)?;
        // redundant with new workflow state updates, will eventually remove when Onboarding is removed
        if ob.idv_reqs_initiated_at.is_some() {
            return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
        }
        let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, &self.sv_id)?;

        let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&self.sv_id))?;

        decision::vendor::build_verification_requests_and_checkpoint(
            conn,
            &uvw,
            &self.sv_id,
            &decision_intent.id,
            &tvc,
        )?;
        ob.into_inner()
            .update(conn, OnboardingUpdate::idv_reqs_initiated_and_is_authorized())?;

        Ok(States::from(VendorCalls {
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
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        // TODO: consolidate with other init
        let (ob, sv) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let sv = ScopedVault::get(conn, &workflow.scoped_vault_id)?;
                let (ob, _, _, _) = Onboarding::get(conn, (&sv.id, &sv.vault_id))?;
                Ok((ob, sv))
            })
            .await??;
        Ok(VendorCalls {
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
        let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
            &self.ob_id,
            &self.sv_id,
            &state.db_pool,
            &state.enclave_client,
        )
        .await?;

        let tvc = TenantVendorControl::new(
            self.t_id.clone(),
            &state.db_pool,
            &state.enclave_client,
            &state.config,
        )
        .await?;
        let vendor_results = decision::engine::make_vendor_requests(
            &state.db_pool,
            &self.ob_id,
            &state.enclave_client,
            state.config.service_config.is_production(),
            vendor_requests.outstanding_requests,
            &state.feature_flag_client,
            &state.footprint_vendor_http_client,
            &state.socure_production_client,
            &state.twilio_client.client,
            &state.footprint_vendor_http_client,
            tvc,
        )
        .await?;

        let has_critical_error = !vendor_results.critical_errors.is_empty();
        let error_message = format!("{:?}", vendor_results.all_errors());

        // 🤔 I think if we are doing bulk vendor calls, we want to save every VRes we can, even if there is a critical error that is blocking us from transitioning
        // to `Decisioning`- so I think we should save the VRes's here and not in the on_commit txn. Alternatively we could have a `VendorError` state,
        // but that just introduces so many extra states to cover errors
        // TODO: For failed vres's, we should create new Vreq's for those
        let err_vres = vendor_results.all_errors_with_parsable_requests();
        let completed_oustanding_vendor_responses = decision::engine::save_vendor_responses(
            &state.db_pool,
            &vendor_results.successful,
            err_vres,
            &self.ob_id,
        )
        .await?;

        if has_critical_error {
            tracing::error!(errors = error_message, "VendorRequestsFailed");
            return Err(ApiError::VendorRequestsFailed);
        }

        let all_vendor_results: Vec<VendorResult> = vendor_requests
            .completed_requests
            .into_iter()
            .chain(completed_oustanding_vendor_responses.into_iter())
            .collect();

        Ok(all_vendor_results)
    }

    fn on_commit(
        self,
        vendor_results: Vec<VendorResult>,
        _conn: &mut db::TxnPgConn,
    ) -> ApiResult<WorkflowStates> {
        Ok(States::from(Decisioning {
            ob_id: self.ob_id,
            vendor_results,
        })
        .into())
    }
}

/////////////////////
/// Decisioning
/// ////////////////
impl Decisioning {
    pub async fn init(state: &State, workflow: Workflow) -> ApiResult<Self> {
        let (ob, sv) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let sv = ScopedVault::get(conn, &workflow.scoped_vault_id)?;
                let (ob, _, _, _) = Onboarding::get(conn, (&sv.id, &sv.vault_id))?;
                Ok((ob, sv))
            })
            .await??;

        let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
            &ob.id,
            &sv.id,
            &state.db_pool,
            &state.enclave_client,
        )
        .await?;
        if !vendor_requests.outstanding_requests.is_empty() {
            return Err(StateError::StateInitError(
                "Decisioning".to_owned(),
                "outstanding vreqs found".to_owned(),
            )
            .into());
        }
        let vendor_results = vendor_requests.completed_requests;

        Ok(Decisioning {
            ob_id: ob.id,
            vendor_results,
        })
    }
}

#[async_trait]
impl OnAction<MakeDecision> for Decisioning {
    type AsyncRes = (
        OnboardingRulesDecisionOutput,
        Vec<(FootprintReasonCode, Vec<Vendor>)>,
        Vec<VerificationResultId>,
    );

    async fn execute_async_idempotent_actions(
        &self,
        action: MakeDecision,
        state: &State,
    ) -> ApiResult<Self::AsyncRes> {
        let (decision, fv) =
            decision::engine::calculate_decision(self.vendor_results.clone(), &state.feature_flag_client)?;

        let obid = self.ob_id.clone();
        // TODO: refactor DE code so we *only* do the FF call here but do calculate_decision and the reason_code creation within on_commit
        let reason_codes =
            engine::reason_codes_for_tenant(&state.db_pool, state.feature_flag_client.clone(), obid, &fv)
                .await?;
        let verification_result_ids = fv.verification_results();

        Ok((decision, reason_codes, verification_result_ids))
    }

    fn on_commit(self, async_res: Self::AsyncRes, conn: &mut db::TxnPgConn) -> ApiResult<WorkflowStates> {
        let (rules_output, reason_codes, verification_result_ids) = async_res;
        let (ob, _, _, _) = Onboarding::get(conn, &self.ob_id)?;
        engine::save_onboarding_decision(
            conn,
            &ob,
            rules_output,
            reason_codes,
            verification_result_ids,
            true,
        )?;
        Ok(States::from(Complete).into())
    }
}

/////////////////////
/// Complete
/// ////////////////
impl Complete {
    pub async fn init(_state: &State, workflow: Workflow) -> ApiResult<Self> {
        Ok(Complete)
    }
}
