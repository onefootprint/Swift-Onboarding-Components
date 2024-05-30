use crate::decision::features::incode_docv::{
    self,
    IncodeOcrComparisonDataFields,
};
use crate::decision::features::risk_signals::risk_signal_group_struct::Aml;
use crate::decision::features::risk_signals::{
    RiskSignalGroupStruct,
    RiskSignalsForDecision,
};
use crate::decision::onboarding::Decision;
use crate::decision::vendor::incode::curp_validation::run_curp_validation_check;
use crate::decision::vendor::incode::incode_watchlist::WatchlistCheckKind;
use crate::decision::vendor::neuro_id::run_neuro_call;
use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use crate::decision::vendor::vendor_api::vendor_api_struct::IncodeFetchOCR;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::decision::vendor::{
    self,
};
use crate::decision::{
    self,
    risk,
};
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::{
    VaultWrapper,
    VwArgs,
};
use crate::{
    ApiError,
    State,
};
use crypto::aead::{
    AeadSealedBytes,
    SealingKey,
};
use db::models::decision_intent::DecisionIntent;
use db::models::document_request::{
    DocumentRequest,
    NewDocumentRequestArgs,
};
use db::models::list_entry::{
    ListEntry,
    ListWithDecryptedEntries,
    ListWithEntries,
};
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::rule_instance::RuleInstance;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::user_timeline::UserTimeline;
use db::models::verification_request::VReqIdentifier;
use db::models::workflow::{
    Workflow,
    WorkflowUpdate,
};
use db::{
    DbPool,
    DbResult,
    PgConn,
    TxnPgConn,
};
use idv::incode::watchlist::response::WatchlistResultResponse;
use itertools::Itertools;
use newtypes::{
    CipKind,
    DecisionIntentKind,
    DeviceInsightOperation,
    FootprintReasonCode,
    ListId,
    Locked,
    OnboardingStatus,
    PiiBytes,
    PiiString,
    ReviewReason,
    RuleAction,
    RuleExpressionCondition,
    RuleSetResultId,
    ScopedVaultId,
    SealedVaultBytes,
    StepUpInfo,
    TenantId,
    VaultId,
    VaultOperation,
    VendorAPI,
    VerificationResultId,
    WorkflowId,
};
use std::collections::HashMap;

#[tracing::instrument(skip(db_pool))]
pub async fn get_sv_for_workflow(db_pool: &DbPool, workflow: &Workflow) -> DbResult<ScopedVault> {
    let svid = workflow.scoped_vault_id.clone();
    db_pool.db_query(move |conn| ScopedVault::get(conn, &svid)).await
}

#[tracing::instrument(skip(conn))]
pub fn get_vw_and_obc(
    conn: &mut PgConn,
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
    let ff_client = state.ff_client.clone();
    let fixture_decision = decision::utils::get_fixture_data_decision(ff_client, &v, &wf, t_id)?;

    if fixture_decision.is_some() {
        Ok(decision::sandbox::save_fixture_vendor_result(&state.db_pool, &di, &wf).await?)
    } else {
        vendor::kyc::waterfall::run_kyc_waterfall(state, &di, &wf.id).await
    }
}

#[tracing::instrument(skip(state))]
pub async fn run_curp_check(state: &State, wf_id: &WorkflowId) -> ApiResult<Option<VendorResult>> {
    let wfid = wf_id.clone();
    let (wf, di) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (wf, _) = Workflow::get_with_vault(conn, &wfid)?;
            let di = DecisionIntent::get_or_create_for_workflow(
                conn,
                &wf.scoped_vault_id,
                &wfid,
                DecisionIntentKind::OnboardingKyc,
            )?;
            Ok((wf, di))
        })
        .await?;
    run_curp_validation_check(state, &di, &wf.id).await
}

#[tracing::instrument(skip(state))]
pub async fn run_neuro_check(
    state: &State,
    wf_id: &WorkflowId,
    t_id: &TenantId,
) -> ApiResult<Option<VendorResult>> {
    let wfid = wf_id.clone();
    let (wf, di) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (wf, _) = Workflow::get_with_vault(conn, &wfid)?;
            let di = DecisionIntent::get_or_create_for_workflow(
                conn,
                &wf.scoped_vault_id,
                &wfid,
                DecisionIntentKind::OnboardingKyc,
            )?;
            Ok((wf, di))
        })
        .await?;
    run_neuro_call(state, &di, &wf.id, t_id).await
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
    let ff_client = state.ff_client.clone();
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
        // maybe in future it might make sense to also re-use an existing search for AML calls we make from
        // workflows?
        vendor::incode::incode_watchlist::run_watchlist_check(
            state,
            &di,
            &obc.key,
            WatchlistCheckKind::MakeNewSearch,
        )
        .await
    }
}

pub enum DecisionOutput {
    Terminal,
    NonTerminal,
}

#[tracing::instrument(skip(conn))]
#[allow(clippy::too_many_arguments)]
pub fn handle_rules_output(
    conn: &mut TxnPgConn,
    wf: Locked<Workflow>,
    v_id: VaultId,
    vres_ids: Vec<VerificationResultId>,
    rules_output: Decision,
    rsr_id: Option<RuleSetResultId>,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<DecisionOutput> {
    if let Decision::RulesExecuted {
        action: Some(RuleAction::StepUp(suk)),
        ..
    } = rules_output
    {
        let doc_reqs = suk
            .to_doc_configs()
            .into_iter()
            .map(|config| NewDocumentRequestArgs {
                scoped_vault_id: wf.scoped_vault_id.clone(),
                workflow_id: wf.id.clone(),
                rule_set_result_id: rsr_id.clone(),
                config,
            })
            .collect();
        let doc_reqs = DocumentRequest::bulk_create(conn, doc_reqs)?;
        let stepup_info = StepUpInfo {
            document_request_ids: doc_reqs.into_iter().map(|dr| dr.id).collect(),
        };
        // Leave a timeline event showing step up was requested
        UserTimeline::create(conn, stepup_info, v_id, wf.scoped_vault_id.clone())?;

        // Move the workflow back into an Incomplete state to show we are waiting for data from user
        let update = WorkflowUpdate::set_status(OnboardingStatus::Incomplete);
        Workflow::update(wf, conn, update)?;
        Ok(DecisionOutput::NonTerminal)
    } else {
        risk::save_final_decision(conn, &wf.id, vres_ids, rules_output, rsr_id, review_reasons)?;
        Ok(DecisionOutput::Terminal)
    }
}

pub async fn maybe_generate_ocr_reason_codes(
    state: &State,
    wf_id: &WorkflowId,
    vw: &VaultWrapper,
) -> ApiResult<Option<Vec<NewRiskSignalInfo>>> {
    let wfid = wf_id.clone();
    let (obc, _) = state
        .db_pool
        .db_query(move |conn| ObConfiguration::get(conn, &wfid))
        .await?;

    if !obc.is_doc_first {
        return Ok(None);
    }

    // TODO: instead of retrieving all results from all vendor calls here, we could just retrieve the
    // ones for the DocScan DI or even just directly retrieve IncodeFetchOCR itself also slightly
    // sketch to query latest by sv_id instead of strictly querying from vres's made within this
    // workflow specifically
    let wfid = wf_id.clone();
    let Some((fetch_ocr, vres_id)) = load_response_for_vendor_api(
        state,
        VReqIdentifier::WfId(wfid),
        &vw.vault.e_private_key,
        IncodeFetchOCR,
    )
    .await?
    .ok() else {
        tracing::warn!(?wf_id, "error getting incode response for doc first risk signals");
        return Ok(None);
    };

    let ocr_comparison_data = IncodeOcrComparisonDataFields::compose(&state.enclave_client, vw).await?;

    let ocr_reason_codes =
        incode_docv::pii_matching_reason_codes_from_ocr_response(&fetch_ocr, ocr_comparison_data)
            .into_iter()
            .map(|r| (r, VendorAPI::IncodeFetchOcr, vres_id.clone()))
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
    vw: &VaultWrapper,
    kyc_vendor_result: VendorResult,
) -> ApiResult<RiskSignalGroupStruct<Aml>> {
    decision::features::risk_signals::parse_reason_codes_from_vendor_result(kyc_vendor_result, vw)
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

pub fn list_ids_from_rules(rules: &[RuleInstance]) -> Vec<ListId> {
    rules
        .iter()
        .flat_map(|ri| &ri.rule_expression.0)
        .filter_map(|re| match re {
            RuleExpressionCondition::VaultData(op) => match op {
                VaultOperation::Equals { .. } => None,
                VaultOperation::IsIn {
                    field: _,
                    op: _,
                    value,
                } => Some(value.clone()),
            },
            RuleExpressionCondition::DeviceInsight(op) => match op {
                DeviceInsightOperation::IsIn {
                    field: _,
                    op: _,
                    value,
                } => Some(value.clone()),
            },
            RuleExpressionCondition::RiskSignal { .. } | RuleExpressionCondition::RiskScore { .. } => None,
        })
        .collect_vec()
}

pub async fn saturate_list_entries(
    state: &State,
    tenant: &Tenant,
    lists: HashMap<ListId, ListWithEntries>,
) -> ApiResult<HashMap<ListId, ListWithDecryptedEntries>> {
    let lists = lists.values().collect_vec();

    let list_keys = lists
        .iter()
        .map(|(list, _)| SealedVaultBytes::from(list.e_data_key.clone()))
        .collect_vec();
    let list_keys = list_keys
        .iter()
        .map(|k| (&tenant.e_private_key, k, vec![]))
        .collect_vec();

    let decrypted_keys = state
        .enclave_client
        .batch_decrypt_to_piibytes(list_keys)
        .await?
        .into_iter()
        .map(|dk| SealingKey::new(dk.into_leak()))
        .collect::<Result<Vec<_>, _>>()?;

    decrypted_keys
        .into_iter()
        .zip(lists.into_iter())
        .map(|(key, (list, entries))| {
            entries
                .iter()
                .map(|le| decrypt_list_entry(&key, le).map(|d| (le.clone(), d)))
                .collect::<Result<Vec<_>, _>>()
                .map(|v| (list.id.clone(), (list.clone(), v)))
        })
        .collect::<Result<HashMap<ListId, ListWithDecryptedEntries>, _>>()
}

fn decrypt_list_entry(key: &SealingKey, le: &ListEntry) -> ApiResult<PiiString> {
    key.unseal_bytes(AeadSealedBytes(le.e_data.clone().0))
        .map_err(ApiError::from)
        .map(PiiBytes::new)
        .and_then(|b| PiiString::try_from(b).map_err(ApiError::from))
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
