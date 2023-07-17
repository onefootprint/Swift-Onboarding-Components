use std::sync::Arc;

use db::{
    models::{
        decision_intent::DecisionIntent,
        document_request::DocumentRequest,
        onboarding::{Onboarding, OnboardingUpdate},
        scoped_vault::ScopedVault,
        vault::Vault,
        workflow::Workflow,
    },
    DbError, DbPool, DbResult, TxnPgConn,
};
use newtypes::{
    DecisionStatus, FootprintReasonCode, OnboardingId, ReviewReason, ScopedVaultId, TenantId, VaultKind,
    VendorAPI, VerificationResultId, WorkflowId,
};
use webhooks::WebhookClient;

use crate::{
    decision::{
        self, engine,
        features::risk_signals::RiskSignalsForDecision,
        onboarding::{
            Decision, DecisionReasonCodes, OnboardingRulesDecisionOutput,
            WaterfallOnboardingRulesDecisionOutput,
        },
        utils::FixtureDecision,
        vendor::{
            tenant_vendor_control::TenantVendorControl,
            vendor_api::{
                vendor_api_response::build_vendor_response_map_from_vendor_results,
                vendor_api_struct::{ExperianPreciseID, IdologyExpectID},
            },
            vendor_result::VendorResult,
        },
    },
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::{Any, TenantVw, VaultWrapper, VwArgs},
    ApiError, State,
};

use super::{traits::HasRuleGroup, StateError};

#[tracing::instrument(skip(db_pool))]
pub async fn get_onboarding_for_workflow(
    db_pool: &DbPool,
    workflow: &Workflow,
) -> DbResult<(Onboarding, ScopedVault)> {
    let svid = workflow.scoped_vault_id.clone();
    db_pool
        .db_query(move |conn| -> DbResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;
            let (ob, _, _, _) = Onboarding::get(conn, (&sv.id, &sv.vault_id))?;
            Ok((ob, sv))
        })
        .await?
}

#[tracing::instrument(skip(conn, tvc))]
pub fn setup_kyc_onboarding_vreqs(
    conn: &mut TxnPgConn,
    tvc: TenantVendorControl,
    is_redo: bool,
    ob_id: &OnboardingId,
    sv_id: &ScopedVaultId,
) -> ApiResult<()> {
    let ob = Onboarding::lock(conn, ob_id)?;
    // redundant with new workflow state updates, will eventually remove when Onboarding is removed
    if !is_redo {
        if ob.idv_reqs_initiated_at.is_some() {
            return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
        }

        Onboarding::update(ob, conn, OnboardingUpdate::idv_reqs_initiated_and_is_authorized())?;
    }
    // TODO: create new DI if is_redo
    let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, sv_id)?;

    let uvw = VaultWrapper::build(conn, VwArgs::Tenant(sv_id))?;

    decision::vendor::build_verification_requests_and_checkpoint(
        conn,
        &uvw,
        sv_id,
        &decision_intent.id,
        &tvc,
    )?;
    Ok(())
}

#[tracing::instrument(skip(state))]
pub async fn make_outstanding_kyc_vendor_calls(
    state: &State,
    sv_id: &ScopedVaultId,
    ob_id: &OnboardingId,
    t_id: &TenantId,
) -> ApiResult<Vec<VendorResult>> {
    let svid = sv_id.clone();
    let vault = state
        .db_pool
        .db_query(move |conn| Vault::get(conn, &svid))
        .await??;
    let fixture_decision =
        decision::utils::get_fixture_data_decision(state.feature_flag_client.clone(), &vault, t_id)?;

    let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
        ob_id,
        sv_id,
        &state.db_pool,
        &state.enclave_client,
    )
    .await?;

    // If we are Sandbox/Demo, we do not make real vendor calls and instead just artificially produce some canned vendor responses
    let vendor_results = if fixture_decision.is_some() {
        decision::sandbox::get_fixture_vendor_results(vendor_requests.outstanding_requests)?
    } else {
        let tvc = TenantVendorControl::new(t_id.clone(), &state.db_pool, &state.config).await?;
        // TODO: we could refactor this to return just the plaintext raw responses and then encrypt and save them in the on_commit txn
        decision::engine::make_vendor_requests(
            &state.db_pool,
            ob_id,
            &state.enclave_client,
            state.config.service_config.is_production(),
            vendor_requests.outstanding_requests,
            state.feature_flag_client.clone(),
            state.vendor_clients.idology_expect_id.clone(),
            state.vendor_clients.socure_id_plus.clone(),
            state.vendor_clients.twilio_lookup_v2.clone(),
            state.vendor_clients.experian_cross_core.clone(),
            tvc,
        )
        .await?
    };

    let has_critical_error = !vendor_results.critical_errors.is_empty();
    let error_message = format!("{:?}", vendor_results.all_errors());

    // 🤔 I think if we are doing bulk vendor calls, we want to save every VRes we can, even if there is a critical error that is blocking us from transitioning
    // to `Decisioning`- so I think we should save the VRes's here and not in the on_commit txn. Alternatively we could have a `VendorError` state,
    // but that just introduces so many extra states to cover errors
    // TODO: For failed vres's, we should create new Vreq's for those
    let err_vres = vendor_results.all_errors_with_parsable_requests();
    let completed_oustanding_vendor_responses =
        decision::engine::save_vendor_responses(&state.db_pool, &vendor_results.successful, err_vres, ob_id)
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

#[tracing::instrument(skip(state))]
pub async fn assert_kyc_vendor_calls_completed(
    state: &State,
    ob_id: &OnboardingId,
    sv_id: &ScopedVaultId,
) -> ApiResult<Vec<VendorResult>> {
    let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
        ob_id,
        sv_id,
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
    Ok(vendor_requests.completed_requests)
}

pub type KycDecision = (
    WaterfallOnboardingRulesDecisionOutput,
    Vec<(FootprintReasonCode, VendorAPI, VerificationResultId)>,
);

// TODO: this is an awful temporary hack but should go away when we refactor things so we pass reason codes directly into rule execution
// In sandbox/demo, we still make Vres's based on the Tenant's TVC. We should probably just have some dummy TestVendor or something or
// always simulate just Idology, but for now we just robustly take the first of either Idology or Experian that exists
#[tracing::instrument(skip_all)]
pub fn get_vres_id_for_fixture(vendor_results: &[VendorResult]) -> ApiResult<VerificationResultId> {
    let (_, vendor_ids_map) = build_vendor_response_map_from_vendor_results(vendor_results)?;
    let idology = vendor_ids_map
        .get(&IdologyExpectID)
        .map(|r| r.verification_result_id.clone());
    let experian = vendor_ids_map
        .get(&ExperianPreciseID)
        .map(|r| r.verification_result_id.clone());
    Ok(idology.or(experian).ok_or(decision::Error::FixtureVresNotFound)?)
}

#[tracing::instrument(skip_all)]
pub fn kyc_decision_from_fixture(
    fixture_decision: FixtureDecision,
    vendor_results: &[VendorResult],
) -> ApiResult<KycDecision> {
    let rules_output = OnboardingRulesDecisionOutput::from(fixture_decision).into();
    let reason_codes = decision::sandbox::get_fixture_reason_codes(fixture_decision, VaultKind::Person);
    let vres_id = get_vres_id_for_fixture(vendor_results)?;
    let reason_codes = reason_codes
        .into_iter()
        .map(|r| (r.0, r.1, vres_id.clone()))
        .collect();
    Ok((rules_output, reason_codes))
}

#[tracing::instrument(skip_all)]
pub fn alpaca_kyc_decision_from_fixture(
    fixture_decision: FixtureDecision,
    vendor_results: &[VendorResult],
) -> ApiResult<KycDecision> {
    let decision_status = match fixture_decision {
        // #manualreview -> we want KYC to pass here and then we have a watchlist hit which actually triggers the workflow to go to PendingReview
        (newtypes::DecisionStatus::Fail, true) => DecisionStatus::Pass,
        // #fail
        (newtypes::DecisionStatus::Fail, false) => DecisionStatus::Fail,
        // #pass
        (newtypes::DecisionStatus::Pass, _) => DecisionStatus::Pass,
        // #stepup
        (newtypes::DecisionStatus::StepUp, _) => DecisionStatus::StepUp,
    };
    let rules_output = WaterfallOnboardingRulesDecisionOutput {
        output: OnboardingRulesDecisionOutput {
            decision: Decision {
                decision_status,
                should_commit: false,
                create_manual_review: false,
                // not used
                vendor_api: VendorAPI::IdologyExpectID,
            },
            rules_triggered: vec![],
            rules_not_triggered: vec![],
        },
        additional_evaluated: vec![],
    };
    let reason_codes = decision::sandbox::get_fixture_reason_codes_alpaca(fixture_decision);
    let vres_id = get_vres_id_for_fixture(vendor_results)?;
    let reason_codes = reason_codes
        .into_iter()
        .map(|r| (r.0, r.1, vres_id.clone()))
        .collect();

    Ok((rules_output, reason_codes))
}

#[tracing::instrument(skip_all)]
pub fn get_decision(
    rule_group: &impl HasRuleGroup,
    conn: &mut TxnPgConn,
    risk_signals: RiskSignalsForDecision,
    sv_id: &ScopedVaultId,
) -> ApiResult<(WaterfallOnboardingRulesDecisionOutput, DecisionReasonCodes)> {
    let include_doc = DocumentRequest::get(conn, sv_id)?.is_some();
    let (rules_output, reason_codes) = rule_group.rule_group(include_doc).evaluate(risk_signals)?;
    Ok((rules_output, reason_codes))
}

#[tracing::instrument(skip(conn, _webhook_client))]
#[allow(clippy::too_many_arguments)]
pub fn save_kyc_decision(
    conn: &mut TxnPgConn,
    _webhook_client: Arc<dyn WebhookClient>,
    ob_id: &OnboardingId,
    sv_id: &ScopedVaultId,
    workflow_id: &WorkflowId,
    verification_result_ids: Vec<VerificationResultId>,
    rules_output: WaterfallOnboardingRulesDecisionOutput,
    is_redo: bool,
    is_sandbox: bool,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<()> {
    let (ob, _, _, _) = Onboarding::get(conn, ob_id)?;
    engine::save_onboarding_decision(
        conn,
        &ob,
        rules_output,
        verification_result_ids,
        !is_redo, // TODO: refactor this completely and just don't update or assert an Onboarding stuff is is_redo. later, remove Onboarding compeltely
        is_sandbox,
        Some(workflow_id.clone()),
        review_reasons,
    )?;
    Ok(())
}

#[tracing::instrument(skip(state))]
pub async fn write_authorized_fingerprints(state: &State, sv_id: &ScopedVaultId) -> ApiResult<()> {
    let sv_id = sv_id.clone();
    let (obc, vw) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uvw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &sv_id)?;
            let obc = uvw.onboarding.clone().ok_or(DbError::ObjectNotFound)?;
            Ok((obc.1, uvw))
        })
        .await??;
    vw.create_authorized_fingerprints(state, obc.clone()).await
}
