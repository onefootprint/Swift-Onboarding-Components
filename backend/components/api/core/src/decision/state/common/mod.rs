use std::sync::Arc;

use db::{
    models::{
        decision_intent::DecisionIntent,
        onboarding::{Onboarding, OnboardingUpdate},
        scoped_vault::ScopedVault,
        workflow::Workflow,
    },
    DbPool, DbResult, TxnPgConn,
};
use feature_flag::FeatureFlagClient;
use newtypes::{OnboardingId, ScopedVaultId, TenantId, VaultKind, WorkflowId};

use crate::{
    decision::{
        self, engine,
        onboarding::OnboardingRulesDecisionOutput,
        utils::FixtureDecision,
        vendor::{tenant_vendor_control::TenantVendorControl, vendor_result::VendorResult},
    },
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::{VaultWrapper, VwArgs},
    ApiError, State,
};

use super::StateError;

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
        ob.into_inner()
            .update(conn, OnboardingUpdate::idv_reqs_initiated_and_is_authorized())?;
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

pub async fn make_outstanding_kyc_vendor_calls(
    state: &State,
    sv_id: &ScopedVaultId,
    ob_id: &OnboardingId,
    t_id: &TenantId,
) -> ApiResult<Vec<VendorResult>> {
    let fixture_decision =
        decision::utils::get_fixture_data_decision(state, state.feature_flag_client.clone(), sv_id, t_id)
            .await?;

    let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
        ob_id,
        sv_id,
        &state.db_pool,
        &state.enclave_client,
    )
    .await?;

    // If we are Sandbox/Demo, we do not make real vendor calls and instead just artificially produce some canned vendor responses
    let vendor_results = if let (Some(fixture_decision)) = fixture_decision {
        decision::sandbox::get_fixture_vendor_results(vendor_requests.outstanding_requests)?
    } else {
        let tvc =
            TenantVendorControl::new(t_id.clone(), &state.db_pool, &state.enclave_client, &state.config)
                .await?;
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

pub fn create_kyc_decision(
    conn: &mut TxnPgConn,
    t_id: &TenantId,
    ob_id: &OnboardingId,
    fixture_decision: Option<FixtureDecision>,
    vendor_results: Vec<VendorResult>,
    is_redo: bool,
    workflow_id: &WorkflowId,
) -> ApiResult<OnboardingRulesDecisionOutput> {
    let verification_result_ids = vendor_results
        .iter()
        .map(|vr| vr.verification_result_id.clone())
        .collect();

    // If we are Sandbox/Demo, we use the predefined decision output and generate random reason codes. Else we run our rules engine for realsies
    let (rules_output, reason_codes, is_sandbox) = if let Some(fixture_decision) = fixture_decision {
        let rules_output = OnboardingRulesDecisionOutput::from(fixture_decision);
        let reason_codes = decision::sandbox::get_fixture_reason_codes(fixture_decision, VaultKind::Person);
        (rules_output, reason_codes, true)
    } else {
        let (rules_output, reason_codes, fv) = decision::engine::calculate_decision(vendor_results)?;
        (rules_output, reason_codes, false)
    };

    let (ob, _, _, _) = Onboarding::get(conn, ob_id)?;
    engine::save_onboarding_decision(
        conn,
        &ob,
        rules_output.clone(),
        reason_codes,
        verification_result_ids,
        !is_redo, // TODO: refactor this completely and just don't update or assert an Onboarding stuff is is_redo. later, remove Onboarding compeltely
        is_sandbox,
        Some(workflow_id.clone()),
    )?;
    Ok(rules_output)
}
