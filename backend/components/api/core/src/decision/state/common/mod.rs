use db::{
    models::{
        data_lifetime::DataLifetime,
        decision_intent::DecisionIntent,
        document_request::DocumentRequest,
        ob_configuration::ObConfiguration,
        risk_signal::NewRiskSignalInfo,
        scoped_vault::ScopedVault,
        vault::Vault,
        workflow::{Workflow, WorkflowUpdate},
    },
    DbPool, DbResult, TxnPgConn,
};
use newtypes::{
    DecisionIntentKind, DecisionStatus, FootprintReasonCode, Locked, OnboardingStatus, ReviewReason,
    ScopedVaultId, TenantId, VendorAPI, VerificationResultId, WorkflowId,
};

use crate::{
    decision::{
        self, engine,
        features::{
            incode_docv::{self, IncodeOcrComparisonDataFields},
            risk_signals::RiskSignalsForDecision,
        },
        onboarding::{
            rules::KycRuleExecutionConfig, Decision, DecisionResult, OnboardingRulesDecision,
            OnboardingRulesDecisionOutput, WaterfallOnboardingRulesDecisionOutput,
        },
        utils::{should_execute_rules_for_document_only, FixtureDecision},
        vendor::{
            tenant_vendor_control::TenantVendorControl,
            vendor_api::{
                vendor_api_response::build_vendor_response_map_from_vendor_results,
                vendor_api_struct::{ExperianPreciseID, IdologyExpectID, IncodeFetchOCR},
            },
            vendor_result::VendorResult,
        },
    },
    errors::{onboarding::OnboardingError, ApiErrorKind, ApiResult},
    utils::vault_wrapper::{Any, TenantVw, VaultWrapper, VwArgs},
    State,
};

use super::{traits::HasRuleGroup, StateError};

#[tracing::instrument(skip(db_pool))]
pub async fn get_sv_for_workflow(db_pool: &DbPool, workflow: &Workflow) -> DbResult<ScopedVault> {
    let svid = workflow.scoped_vault_id.clone();
    db_pool
        .db_query(move |conn| ScopedVault::get(conn, &svid))
        .await?
}

#[tracing::instrument(skip(conn))]
pub fn get_vw_and_obc(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    wf_id: &WorkflowId,
) -> ApiResult<(VaultWrapper, ObConfiguration)> {
    let (obc, _) = ObConfiguration::get(conn, wf_id)?;

    // TODO: store authorized_seqno and use this here and for the seqno in the Vreq's for the vendor calls
    let seqno = DataLifetime::get_current_seqno(conn)?;
    let vw = VaultWrapper::<_>::build(conn, VwArgs::Historical(sv_id, seqno))?;

    Ok((vw, obc))
}

#[tracing::instrument(skip(conn, tvc))]
pub fn setup_kyc_onboarding_vreqs(
    conn: &mut TxnPgConn,
    tvc: TenantVendorControl,
    sv_id: &ScopedVaultId,
    wf: Locked<Workflow>,
) -> ApiResult<()> {
    let update = WorkflowUpdate::set_status(OnboardingStatus::Pending);
    let wf = Workflow::update(wf, conn, update)?;
    // TODO: create new DI if is_redo
    let decision_intent =
        DecisionIntent::get_or_create_for_workflow(conn, sv_id, &wf.id, DecisionIntentKind::OnboardingKyc)?;

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
    wf_id: &WorkflowId,
    t_id: &TenantId,
) -> ApiResult<Vec<VendorResult>> {
    let wfid = wf_id.clone();
    let (wf, v) = state
        .db_pool
        .db_query(move |conn| Workflow::get_with_vault(conn, &wfid))
        .await??;
    let ff_client = state.feature_flag_client.clone();
    let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &v, &wf, t_id)?;

    let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
        &wf.scoped_vault_id,
        &state.db_pool,
        &state.enclave_client,
    )
    .await?;

    // If we are Sandbox/Demo, we do not make real vendor calls and instead just artificially produce some canned vendor responses
    let vendor_results = if fixture_decision.is_some() {
        decision::sandbox::get_fixture_vendor_results(vendor_requests.outstanding_requests)?
    } else {
        let tvc =
            TenantVendorControl::new(t_id.clone(), &state.db_pool, &state.config, &state.enclave_client)
                .await?;
        // TODO: we could refactor this to return just the plaintext raw responses and then encrypt and save them in the on_commit txn
        decision::engine::make_vendor_requests(state, tvc, vendor_requests.outstanding_requests, wf_id)
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
        decision::engine::save_vendor_responses(&state.db_pool, &vendor_results.successful, err_vres, wf_id)
            .await?;

    if has_critical_error {
        tracing::error!(
            errors = error_message,
            scoped_vault_id = %wf.scoped_vault_id,
            tenant_id = %t_id,
            "VendorRequestsFailed"
        );
        if !vendor_results.has_sufficient_results_for_kyc() {
            return Err(ApiErrorKind::VendorRequestsFailed.into());
        }
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
    sv_id: &ScopedVaultId,
) -> ApiResult<Vec<VendorResult>> {
    let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
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

pub fn kyc_decision_from_fixture(
    fixture_decision: FixtureDecision,
) -> ApiResult<WaterfallOnboardingRulesDecisionOutput> {
    let rules_output = OnboardingRulesDecisionOutput::from(fixture_decision);
    let output = WaterfallOnboardingRulesDecisionOutput::new(
        DecisionResult::Evaluated(rules_output),
        DecisionResult::NotRequired,
        vec![],
    );

    Ok(output)
}

#[tracing::instrument(skip_all)]
pub fn alpaca_kyc_decision_from_fixture(
    fixture_decision: FixtureDecision,
) -> ApiResult<WaterfallOnboardingRulesDecisionOutput> {
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

    let final_decision = OnboardingRulesDecisionOutput {
        decision: Decision {
            decision_status,
            should_commit: false,
            create_manual_review: false,
            // not used
            vendor_api: VendorAPI::IdologyExpectID,
        },
        rules_triggered: vec![],
        rules_not_triggered: vec![],
    };
    let rules_output = WaterfallOnboardingRulesDecisionOutput::new(
        DecisionResult::Evaluated(final_decision),
        DecisionResult::NotRequired,
        vec![],
    );

    Ok(rules_output)
}

#[tracing::instrument(skip_all)]
pub fn get_decision(
    rule_group: &impl HasRuleGroup,
    conn: &mut TxnPgConn,
    risk_signals: RiskSignalsForDecision,
    wf: &Workflow,
    vault: &Vault,
) -> ApiResult<WaterfallOnboardingRulesDecisionOutput> {
    let include_doc = DocumentRequest::get(conn, &wf.id)?.is_some();
    let document_only = should_execute_rules_for_document_only(vault, wf)?;
    let config = KycRuleExecutionConfig {
        include_doc,
        document_only,
    };
    let rules_output = rule_group.rule_group().evaluate(risk_signals, config)?;
    Ok(rules_output)
}

#[tracing::instrument(skip(conn))]
#[allow(clippy::too_many_arguments)]
pub fn save_kyc_decision(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    workflow: &Workflow,
    verification_result_ids: Vec<VerificationResultId>,
    rules_output: OnboardingRulesDecision,
    is_sandbox: bool,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<()> {
    engine::save_onboarding_decision(
        conn,
        workflow,
        rules_output,
        verification_result_ids,
        is_sandbox,
        review_reasons,
    )?;
    Ok(())
}

#[tracing::instrument(skip(state))]
pub async fn write_authorized_fingerprints(state: &State, wf_id: &WorkflowId) -> ApiResult<()> {
    let wf_id = wf_id.clone();
    let (obc, vw) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let wf = Workflow::get(conn, &wf_id)?;
            let uvw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &wf.scoped_vault_id)?;
            let obc_id = wf
                .ob_configuration_id
                .as_ref()
                .ok_or(OnboardingError::NoObcForWorkflow)?;
            let (obc, _) = ObConfiguration::get(conn, obc_id)?;
            Ok((obc, uvw))
        })
        .await??;
    vw.create_authorized_fingerprints(state, obc).await
}

pub async fn generate_ocr_reason_codes(
    state: &State,
    wf_id: &WorkflowId,
    sv_id: &ScopedVaultId,
    vendor_results: &[VendorResult],
) -> ApiResult<Option<Vec<NewRiskSignalInfo>>> {
    let wf_id = wf_id.clone();
    let (obc, _) = state
        .db_pool
        .db_query(move |conn| ObConfiguration::get(conn, &wf_id))
        .await??;

    if !obc.is_doc_first {
        return Ok(None);
    }

    // If this is a doc-first OBC, generate OCR mismatch risk signals
    let (vendor_map, vendor_result_id_map) = build_vendor_response_map_from_vendor_results(vendor_results)?;
    let Some(fetch_ocr) = vendor_map.get(&IncodeFetchOCR) else {
        return Ok(None);
    };
    let Some(vres) = vendor_result_id_map.get(&IncodeFetchOCR) else{
        return Ok(None);
    };

    let sv_id = sv_id.clone();
    let vw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sv_id))
        .await??;
    let ocr_comparison_data = IncodeOcrComparisonDataFields::compose(&state.enclave_client, &vw).await?;

    let ocr_reason_codes =
        incode_docv::reason_codes_from_ocr_response(fetch_ocr.clone(), ocr_comparison_data)?
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchOCR, vres.verification_result_id.clone()))
            .collect();

    Ok(Some(ocr_reason_codes))
}
