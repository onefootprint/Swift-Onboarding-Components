use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web::Json;
use actix_web::web::{
    self,
};
use api_core::decision::features::risk_signals::fetch_latest_risk_signals_map;
use api_core::decision::features::risk_signals::parse_reason_codes_from_vendor_result;
use api_core::decision::onboarding::Decision;
use api_core::decision::rule_engine::engine::EvaluateWorkflowDecisionArgs;
use api_core::decision::rule_engine::engine::VaultDataForRules;
use api_core::decision::rule_engine::eval::RuleEvalConfig;
use api_core::decision::rule_engine::{
    self,
};
use api_core::decision::state::common::DecisionOutput;
use api_core::decision::state::common::{
    self,
};
use api_core::decision::vendor::get_vendor_apis_for_verification_requests;
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::decision::vendor::vendor_result::VendorResult;
use api_core::decision::{
    self,
};
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::AssertionError;
use api_core::task;
use api_core::types::ModernApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::VwArgs;
use api_core::ApiErrorKind;
use api_core::FpResult;
use api_core::State;
use api_errors::FpError;
use chrono::Utc;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::RiskSignal;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::DecisionIntentId;
use newtypes::FpId;
use newtypes::RiskSignalGroupKind;
use newtypes::RiskSignalId;
use newtypes::RuleAction;
use newtypes::RuleInstanceKind;
use newtypes::RuleSetResultKind;
use newtypes::TenantId;
use newtypes::VaultKind;
use newtypes::Vendor;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;
use std::collections::HashMap;
use std::str::FromStr;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct MakeVendorCallsRequest {
    pub wf_id: WorkflowId,
    pub vendor_api: VendorAPI,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct MakeVendorCallsResponse {
    new_vendor_request_ids: Vec<VerificationRequestId>,
    new_vendor_result_ids: Vec<VerificationResultId>,
    rule_results: Vec<(api_wire_types::Rule, bool)>,
    action_triggered: Option<RuleAction>,
}

#[actix_web::post("/private/protected/risk/make_vendor_calls")]
async fn make_vendor_calls(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<MakeVendorCallsRequest>,
) -> ModernApiResult<MakeVendorCallsResponse> {
    let MakeVendorCallsRequest { wf_id, vendor_api } = request.into_inner();
    let (wf, sv) = state
        .db_pool
        .db_query(move |conn| Workflow::get_all(conn, &wf_id))
        .await?;
    let tid = sv.tenant_id.clone();
    let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.config, &state.enclave_client).await?;
    let tvc2 = tvc.clone();

    let wf_id = wf.id.clone();
    let (requests, vw, rules) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&sv.id))?;
            let decision_intent =
                DecisionIntent::create(conn, newtypes::DecisionIntentKind::ManualRunKyc, &sv.id, None)?;

            let available_vendor_apis =
                get_vendor_apis_for_verification_requests(uvw.populated().as_slice(), &tvc2)?;
            if !available_vendor_apis.contains(&vendor_api) {
                Err(ApiErrorKind::AssertionError(format!(
                    "{vendor_api} not enabled for tenant!"
                )))?;
            }
            let request =
                VerificationRequest::create(conn, (&sv.id, &decision_intent.id, vendor_api).into())?;

            let (obc, _) = ObConfiguration::get(conn, &wf_id)?;
            let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, &obc.id, IncludeRules::All)?;
            Ok((vec![request], uvw, rules))
        })
        .await?;

    let vendor_results = decision::engine::make_vendor_requests(&state, tvc, requests, &wf.id).await?;

    if !vendor_results.critical_errors.is_empty() {
        return Err(ApiErrorKind::VendorRequestsFailed)?;
    }

    let vendor_result = decision::engine::save_vendor_responses(
        &state.db_pool,
        &vendor_results.successful,
        vendor_results.all_errors_with_parsable_requests(),
        &wf.id,
    )
    .await?
    .pop()
    .ok_or(FpError::from(ApiErrorKind::VendorRequestsFailed))?;

    let reason_codes =
        decision::features::risk_signals::parse_reason_codes_from_vendor_result(vendor_result.clone(), &vw)?
            .kyc
            .footprint_reason_codes
            .into_iter()
            .map(|(frc, _, _)| frc)
            .collect_vec();
    let (rule_results, action_triggered) = decision::rule_engine::eval::evaluate_rule_set(
        rules,
        &reason_codes,
        &VaultDataForRules::empty(), // TODO
        &[],                         // TODO
        &HashMap::new(),             // TODO
        &RuleEvalConfig::default(),
    );

    Ok(MakeVendorCallsResponse {
        new_vendor_request_ids: vec![vendor_result.verification_request_id],
        new_vendor_result_ids: vec![vendor_result.verification_result_id],
        rule_results: rule_results
            .into_iter()
            .map(|(ri, b)| (api_wire_types::Rule::from_db(ri), b))
            .collect_vec(),
        action_triggered,
    })
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct MakeDecisionRequest {
    pub tenant_id: TenantId,
    pub fp_id: FpId,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct MakeDecisionResponse {
    decision: Decision,
}

/// Fetches latest risk signals, executes rules against those, and writes a new onboarding decision
/// from the result For now errors if the decision is StepUp
#[post("/private/protected/risk/make_decision")]
async fn make_decision(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<MakeDecisionRequest>,
) -> ModernApiResult<MakeDecisionResponse> {
    let MakeDecisionRequest { tenant_id, fp_id } = request.into_inner();

    let decision = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let res = ScopedVault::bulk_get(conn, vec![fp_id.clone()], &tenant_id, true)?;
            let (sv, vault) = res.first().ok_or(OnboardingError::NoWorkflow)?;
            let vault_id = sv.vault_id.clone();
            let wf = Workflow::get_active(conn, &sv.id)?.ok_or(OnboardingError::NoWorkflow)?;
            let wf = Workflow::lock(conn, &wf.id)?;
            let (obc, _) = ObConfiguration::get(conn, &wf.id)?;
            let rule_instance_kind = match vault.kind {
                VaultKind::Person => RuleInstanceKind::Person,
                VaultKind::Business => RuleInstanceKind::Business,
            };

            let risk_signals = fetch_latest_risk_signals_map(conn, &sv.id)?;
            let vres_ids = risk_signals.verification_result_ids();

            let args = EvaluateWorkflowDecisionArgs {
                sv_id: &wf.scoped_vault_id,
                obc_id: &obc.id,
                wf_id: &wf.id,
                kind: RuleSetResultKind::Adhoc,
                risk_signals: risk_signals.risk_signals,
                vault_data: &VaultDataForRules::empty(), // TODO
                lists: &HashMap::new(),                  // TODO mb
                is_fixture: false,
                include_rules: IncludeRules::Kind(rule_instance_kind),
            };
            let (decision, rsr_id) = rule_engine::engine::evaluate_workflow_decision(conn, args)?;
            let d = decision.clone();
            let output = common::handle_rules_output(conn, wf, vault_id, vres_ids, decision, rsr_id, vec![])?;
            if matches!(output, DecisionOutput::NonTerminal) {
                return Err(AssertionError("Non-terminal rule action").into());
            }
            Ok(d)
        })
        .await?;

    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    Ok(MakeDecisionResponse { decision })
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ShadowRunRequest {
    pub wf_id: WorkflowId,
    pub vendor_api: VendorAPI,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct ShadowRunResult {
    action_triggered: Option<RuleAction>,
}

#[post("/private/protected/risk/shadow_run_vendor_calls_and_decisioning")]
async fn shadow_run(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<ShadowRunRequest>,
) -> ModernApiResult<ShadowRunResult> {
    let ShadowRunRequest { wf_id, vendor_api } = request.into_inner();
    let vendor_apis = vec![vendor_api];
    let (wf, sv) = state
        .db_pool
        .db_query(move |conn| Workflow::get_all(conn, &wf_id))
        .await?;
    let tid = sv.tenant_id.clone();
    let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.config, &state.enclave_client).await?;
    let wfid = wf.id.clone();
    let (requests, vw, rules) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&sv.id))?;
            let seqno = DataLifetime::get_current_seqno(conn)?;

            #[allow(clippy::unwrap_used)]
            let memory_only_requests = vendor_apis
                .into_iter()
                .map(|v| VerificationRequest {
                    id: VerificationRequestId::from_str("fake in-memory-only VerificationRequest").unwrap(),
                    vendor: Vendor::from(v),
                    timestamp: Utc::now(),
                    _created_at: Utc::now(),
                    _updated_at: Utc::now(),
                    vendor_api: v,
                    uvw_snapshot_seqno: seqno,
                    identity_document_id: None,
                    scoped_vault_id: sv.id.clone(),
                    decision_intent_id: DecisionIntentId::from_str("fake in-memory-only DecisionIntent")
                        .unwrap(),
                })
                .collect();

            let (obc, _) = ObConfiguration::get(conn, &wfid)?;
            let rules = RuleInstance::list(conn, &obc.tenant_id, obc.is_live, &obc.id, IncludeRules::All)?;

            Ok((memory_only_requests, uvw, rules))
        })
        .await?;

    let vendor_results = decision::engine::make_vendor_requests(&state, tvc, requests, &wf.id).await?;

    let all_vendor_errors = vendor_results.all_errors();
    if !all_vendor_errors.is_empty() {
        return Err(ApiErrorKind::AssertionError(format!(
            "Vendor call(s) failed: {:?}",
            &all_vendor_errors
        )))?;
    }

    // calculate_decision currently requires Vec<VendorResult> which we normally get from saving
    // VerificationResult's to PG since we want to keep things in-memory-only, we manually create
    // VendorResult's here with dummy VerificationResultId's
    #[allow(clippy::unwrap_used)]
    let vendor_result = vendor_results
        .successful
        .into_iter()
        .map(|(req, res)| VendorResult {
            response: res,
            verification_result_id: VerificationResultId::from_str("fake in-memory-only VerificationResult")
                .unwrap(),
            verification_request_id: req.id,
        })
        .last()
        .ok_or(FpError::from(ApiErrorKind::VendorRequestsFailed))?;

    let reason_codes =
        decision::features::risk_signals::parse_reason_codes_from_vendor_result(vendor_result.clone(), &vw)?
            .kyc
            .footprint_reason_codes
            .into_iter()
            .map(|(frc, _, _)| frc)
            .collect_vec();
    let (_, action_triggered) = decision::rule_engine::eval::evaluate_rule_set(
        rules,
        &reason_codes,
        &VaultDataForRules::empty(), // TODO
        &[],                         // TODO
        &HashMap::new(),             // TODO
        &RuleEvalConfig::default(),
    );

    Ok(ShadowRunResult { action_triggered })
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct SaveVresRiskSignalsRequest {
    pub vres_id: VerificationResultId,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct SaveVresRiskSignalsResult {
    created_risk_signals: Vec<RiskSignalId>,
}

// If the given vres_id does not have risk signals
// This was used circa 2024-01-12 to fix some missing risk signals on old Fractional vaults and should probably not be used again: https://onefootprint.slack.com/archives/C05U1CAD6FQ/p1705084067751509
#[post("/private/protected/risk/save_risk_signals_for_vres")]
async fn save_risk_signals_for_vres(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<SaveVresRiskSignalsRequest>,
) -> ModernApiResult<SaveVresRiskSignalsResult> {
    let SaveVresRiskSignalsRequest { vres_id } = request.into_inner();

    let (vreq_vres, vw) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let vreq_vres = VerificationResult::get(conn, &vres_id)?;
            let existing_rs = RiskSignal::list_by_verification_result_id(conn, &vres_id)?;
            if !existing_rs.is_empty() {
                return Err(AssertionError("RiskSignal's already exist for vres").into());
            }

            let vw = VaultWrapper::<_>::build(
                conn,
                VwArgs::Historical(&vreq_vres.0.scoped_vault_id, vreq_vres.0.uvw_snapshot_seqno),
            )?;
            Ok((vreq_vres, vw))
        })
        .await?;

    let svid = vreq_vres.0.scoped_vault_id.clone();
    let vendor_result =
        VendorResult::hydrate_vendor_result(vreq_vres, &state.enclave_client, &vw.vault.e_private_key)
            .await?
            .into_vendor_result()
            .ok_or(AssertionError("Error hydrating vres"))?;
    let risk_signals = parse_reason_codes_from_vendor_result(vendor_result, &vw)?;

    let rs: Vec<_> = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let kyc_rs = RiskSignal::bulk_create(
                conn,
                &svid,
                risk_signals.kyc.footprint_reason_codes,
                RiskSignalGroupKind::Kyc,
                false,
            )?;
            let aml_rs = RiskSignal::bulk_create(
                conn,
                &svid,
                risk_signals.aml.footprint_reason_codes,
                RiskSignalGroupKind::Aml,
                false,
            )?;
            Ok(kyc_rs.into_iter().chain(aml_rs).collect())
        })
        .await?;

    Ok(SaveVresRiskSignalsResult {
        created_risk_signals: rs.into_iter().map(|rs| rs.id).collect(),
    })
}
