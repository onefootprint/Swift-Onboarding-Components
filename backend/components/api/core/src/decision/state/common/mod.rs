use db::{
    models::{
        decision_intent::DecisionIntent, document_request::DocumentRequest,
        ob_configuration::ObConfiguration, risk_signal::NewRiskSignalInfo, scoped_vault::ScopedVault,
        vault::Vault, workflow::Workflow,
    },
    DbPool, DbResult, TxnPgConn,
};
use newtypes::{
    DecisionIntentKind, DecisionStatus, FootprintReasonCode, ReviewReason, ScopedVaultId, TenantId,
    VendorAPI, VerificationResultId, WorkflowId,
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
            self,
            vendor_api::{
                vendor_api_response::build_vendor_response_map_from_vendor_results,
                vendor_api_struct::{ExperianPreciseID, IdologyExpectID, IncodeFetchOCR},
            },
            vendor_result::VendorResult,
        },
    },
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::{Any, TenantVw, VaultWrapper, VwArgs},
    State,
};

use super::traits::HasRuleGroup;

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

    let vw = VaultWrapper::<_>::build(conn, VwArgs::Tenant(sv_id))?;

    Ok((vw, obc))
}

#[tracing::instrument(skip(state))]
pub async fn run_kyc_vendor_calls(
    state: &State,
    wf_id: &WorkflowId,
    t_id: &TenantId,
) -> ApiResult<Vec<VendorResult>> {
    let wfid = wf_id.clone();
    let (wf, v, di) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (wf, v) = Workflow::get_with_vault(conn, &wfid)?;
            let di = DecisionIntent::get_or_create_for_workflow(
                conn,
                &wf.scoped_vault_id,
                &wfid,
                DecisionIntentKind::OnboardingKyc,
            )?;
            Ok((wf, v, di))
        })
        .await?;
    let ff_client = state.feature_flag_client.clone();
    let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &v, &wf, t_id)?;

    if fixture_decision.is_some() {
        Ok(vec![
            decision::sandbox::save_fixture_vendor_result(&state.db_pool, &di, &wf).await?,
        ])
    } else {
        vendor::kyc_waterfall::run_kyc_waterfall(state, &di, &wf.id).await
    }
}

#[tracing::instrument(skip(state))]
pub async fn get_latest_vendor_results(state: &State, sv_id: &ScopedVaultId) -> ApiResult<Vec<VendorResult>> {
    decision::engine::get_latest_verification_requests_and_results(
        sv_id,
        &state.db_pool,
        &state.enclave_client,
    )
    .await
    .map(|r| r.completed_requests)
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
    let (obc, _) = ObConfiguration::get(conn, &wf.id)?;
    let include_doc = DocumentRequest::get(conn, &wf.id)?.is_some();
    let document_only = should_execute_rules_for_document_only(vault, wf)?;
    let skip_kyc = obc.skip_kyc;
    let config = KycRuleExecutionConfig {
        include_doc,
        document_only,
        skip_kyc,
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

pub async fn maybe_generate_ocr_reason_codes(
    state: &State,
    wf_id: &WorkflowId,
    sv_id: &ScopedVaultId,
) -> ApiResult<Option<Vec<NewRiskSignalInfo>>> {
    let wf_id = wf_id.clone();
    let (obc, _) = state
        .db_pool
        .db_query(move |conn| ObConfiguration::get(conn, &wf_id))
        .await??;

    if !obc.is_doc_first {
        return Ok(None);
    }

    // TODO: instead of retrieving all results from all vendor calls here, we could just retrieve the ones for the DocScan DI or even just directly retrieve IncodeFetchOCR itself
    // also slightly sketch to query latest by sv_id instead of strictly querying from vres's made within this workflow specifically
    let vendor_results = &get_latest_vendor_results(state, sv_id).await?;

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
        incode_docv::reason_codes_from_ocr_response(fetch_ocr.clone(), ocr_comparison_data)
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchOCR, vres.verification_result_id.clone()))
            .collect();

    Ok(Some(ocr_reason_codes))
}
