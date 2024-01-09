use db::{
    models::{
        decision_intent::DecisionIntent, document_request::DocumentRequest,
        ob_configuration::ObConfiguration, risk_signal::NewRiskSignalInfo, scoped_vault::ScopedVault,
        workflow::Workflow,
    },
    DbPool, DbResult, TxnPgConn,
};
use idv::incode::watchlist::response::WatchlistResultResponse;
use newtypes::{
    CipKind, DecisionIntentKind, DecisionStatus, DocumentRequestKind, FootprintReasonCode, ReviewReason,
    RuleSetResultKind, ScopedVaultId, TenantId, VendorAPI, VerificationResultId, WorkflowId,
};

use crate::{
    decision::{
        self, engine,
        features::{
            incode_docv::{self, IncodeOcrComparisonDataFields},
            risk_signals::{risk_signal_group_struct::Aml, RiskSignalGroupStruct, RiskSignalsForDecision},
        },
        onboarding::{Decision, OnboardingRulesDecisionOutput, WaterfallOnboardingRulesDecisionOutput},
        rule_engine,
        utils::FixtureDecision,
        vendor::{
            self,
            incode_watchlist::WatchlistCheckKind,
            vendor_api::{
                vendor_api_response::build_vendor_response_map_from_vendor_results,
                vendor_api_struct::IncodeFetchOCR,
            },
            vendor_result::VendorResult,
        },
    },
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::{Any, TenantVw, VaultWrapper, VwArgs},
    State,
};

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
) -> ApiResult<VendorResult> {
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
        Ok(decision::sandbox::save_fixture_vendor_result(&state.db_pool, &di, &wf).await?)
    } else {
        vendor::kyc::waterfall::run_kyc_waterfall(state, &di, &wf.id).await
    }
}

// TODO: code share/new abstraction to consolidate this with run_kyc_vendor_calls
#[tracing::instrument(skip(state))]
pub async fn run_aml_call(
    state: &State,
    wf_id: &WorkflowId,
    t_id: &TenantId,
) -> ApiResult<(VerificationResultId, WatchlistResultResponse)> {
    let wfid = wf_id.clone();
    let (wf, obc, v, di) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (wf, v) = Workflow::get_with_vault(conn, &wfid)?;
            let di = DecisionIntent::get_or_create_for_workflow(
                conn,
                &wf.scoped_vault_id,
                &wfid,
                DecisionIntentKind::WatchlistCheck,
            )?;
            let (obc, _) = ObConfiguration::get(conn, &wfid)?;
            Ok((wf, obc, v, di))
        })
        .await?;
    let ff_client = state.feature_flag_client.clone();
    let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &v, &wf, t_id)?;

    if let Some(fixture_decision) = fixture_decision {
        decision::sandbox::save_fixture_incode_watchlist_result(
            &state.db_pool,
            fixture_decision,
            &di.id,
            &wf.scoped_vault_id,
            &v.public_key,
        )
        .await
        .map(|(vr, wr)| (vr.id, wr))
    } else {
        // maybe in future it might make sense to also re-use an existing search for AML calls we make from workflows?
        vendor::incode_watchlist::run_watchlist_check(state, &di, &obc.key, WatchlistCheckKind::MakeNewSearch)
            .await
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

pub fn kyc_decision_from_fixture(fixture_decision: FixtureDecision) -> ApiResult<Decision> {
    let rules_output = OnboardingRulesDecisionOutput::from(fixture_decision);
    Ok(rules_output.decision)
}

#[tracing::instrument(skip_all)]
pub fn alpaca_kyc_decision_from_fixture(fixture_decision: FixtureDecision) -> ApiResult<Decision> {
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

    let decision = Decision {
        decision_status,
        should_commit: false,
        create_manual_review: false,
    };
    Ok(decision)
}

#[tracing::instrument(skip_all)]
pub fn get_decision(
    conn: &mut TxnPgConn,
    risk_signals: RiskSignalsForDecision,
    wf: &Workflow,
    is_fixture: bool,
) -> ApiResult<Decision> {
    let (obc, _) = ObConfiguration::get(conn, &wf.id)?;
    let doc_collected = DocumentRequest::get(conn, &wf.id, DocumentRequestKind::Identity)?.is_some();

    rule_engine::engine::evaluate_workflow_decision(
        conn,
        &wf.scoped_vault_id,
        &obc.id,
        Some(&wf.id),
        RuleSetResultKind::WorkflowDecision,
        risk_signals.risk_signals,
        doc_collected,
        is_fixture,
    )
}

#[tracing::instrument(skip(conn))]
#[allow(clippy::too_many_arguments)]
pub fn save_kyc_decision(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    workflow: &Workflow,
    verification_result_ids: Vec<VerificationResultId>,
    rules_output: Decision,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<()> {
    engine::save_onboarding_decision(
        conn,
        workflow,
        rules_output,
        verification_result_ids,
        review_reasons,
    )?;
    Ok(())
}

#[tracing::instrument(skip(state))]
/// Write new fingerprints as needed
/// - Tenant-scoped fingerprints for data visible to the tenant
/// - Globally-scoped fingerprints for newly portablized data
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
    let Some(vres) = vendor_result_id_map.get(&IncodeFetchOCR) else {
        return Ok(None);
    };

    let sv_id = sv_id.clone();
    let vw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sv_id))
        .await??;
    let ocr_comparison_data = IncodeOcrComparisonDataFields::compose(&state.enclave_client, &vw).await?;

    let ocr_reason_codes =
        incode_docv::pii_matching_reason_codes_from_ocr_response(fetch_ocr, ocr_comparison_data)
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchOcr, vres.verification_result_id.clone()))
            .collect();

    Ok(Some(ocr_reason_codes))
}

pub fn get_aml_risk_signals_from_aml_call(
    obc: &ObConfiguration,
    watchlist_vres_id: &VerificationResultId,
    watchlist_result_response: &WatchlistResultResponse,
) -> RiskSignalGroupStruct<Aml> {
    let wc_reason_codes = decision::features::incode_watchlist::reason_codes_from_watchlist_result(
        watchlist_result_response,
        &obc.enhanced_aml(),
    );
    let footprint_reason_codes = wc_reason_codes
        .into_iter()
        .map(|r| (r, VendorAPI::IncodeWatchlistCheck, watchlist_vres_id.clone()))
        .collect::<Vec<_>>();
    RiskSignalGroupStruct {
        footprint_reason_codes,
        group: Aml,
    }
}

pub fn get_aml_risk_signals_from_kyc_call(
    obc: &ObConfiguration,
    vw: &VaultWrapper,
    kyc_vendor_result: VendorResult,
) -> ApiResult<RiskSignalGroupStruct<Aml>> {
    decision::features::risk_signals::parse_reason_codes_from_vendor_result(kyc_vendor_result, vw, obc)
        .map(|r| r.aml)
}

pub fn get_review_reasons(
    risk_signals: &RiskSignalsForDecision,
    doc_collected: bool,
    obc: &ObConfiguration,
) -> Vec<ReviewReason> {
    match obc.cip_kind {
        // currently review_reason's is just a Alpaca concept
        Some(CipKind::Alpaca) => {
            let watchlist_reason_codes: Vec<_> = risk_signals
                .aml
                .as_ref()
                .map(|a| a.footprint_reason_codes.clone())
                .unwrap_or_default()
                .iter()
                .map(|(rc, _, _)| rc.clone())
                .collect();
            get_review_reasons_inner(&watchlist_reason_codes, doc_collected)
        }
        _ => vec![],
    }
}

pub fn get_review_reasons_inner(
    wc_reason_codes: &[FootprintReasonCode],
    collected_doc: bool,
) -> Vec<ReviewReason> {
    let adverse_media: bool = wc_reason_codes
        .iter()
        .any(|rs| rs == &FootprintReasonCode::AdverseMediaHit);

    let wl_hit = [
        FootprintReasonCode::WatchlistHitOfac,
        FootprintReasonCode::WatchlistHitNonSdn,
        FootprintReasonCode::WatchlistHitWarning,
        FootprintReasonCode::WatchlistHitPep,
    ]
    .iter()
    .any(|r| wc_reason_codes.contains(r));

    let mut reasons = vec![];

    if adverse_media {
        reasons.push(ReviewReason::AdverseMediaHit);
    }
    if wl_hit {
        reasons.push(ReviewReason::WatchlistHit);
    }
    if collected_doc {
        reasons.push(ReviewReason::Document);
    }

    reasons
}

#[cfg(test)]
#[allow(clippy::type_complexity)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(vec![(FootprintReasonCode::WatchlistHitOfac)], false => vec![ReviewReason::WatchlistHit])]
    #[test_case(vec![(FootprintReasonCode::WatchlistHitOfac)], true => vec![ReviewReason::WatchlistHit, ReviewReason::Document])]
    #[test_case(vec![(FootprintReasonCode::WatchlistHitOfac), (FootprintReasonCode::WatchlistHitPep)], true => vec![ReviewReason::WatchlistHit, ReviewReason::Document])]
    #[test_case(vec![(FootprintReasonCode::AdverseMediaHit)], false => vec![ReviewReason::AdverseMediaHit])]
    #[test_case(vec![(FootprintReasonCode::AdverseMediaHit)], true => vec![ReviewReason::AdverseMediaHit, ReviewReason::Document])]
    #[test_case(vec![(FootprintReasonCode::AdverseMediaHit), (FootprintReasonCode::WatchlistHitNonSdn)], true => vec![ReviewReason::AdverseMediaHit, ReviewReason::WatchlistHit,  ReviewReason::Document])]

    fn test_get_review_reasons(
        wc_reason_codes: Vec<FootprintReasonCode>,
        collected_doc: bool,
    ) -> Vec<ReviewReason> {
        get_review_reasons_inner(&wc_reason_codes, collected_doc)
    }
}
