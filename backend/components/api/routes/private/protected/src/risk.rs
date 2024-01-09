use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web::{self, Json};
use api_core::decision::engine;
use api_core::decision::features::risk_signals::risk_signal_group_struct::Kyc;
use api_core::decision::features::risk_signals::{
    fetch_latest_risk_signals_map, parse_reason_codes_from_vendor_result, save_risk_signals,
    RiskSignalGroupStruct,
};
use api_core::decision::onboarding::rules::KycRuleExecutionConfig;
use api_core::decision::onboarding::{rules::KycRuleGroup, Decision, OnboardingRulesDecisionOutput};
use api_core::decision::vendor;
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::decision::vendor::vendor_result::VendorResult;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::AssertionError;
use api_core::errors::{ApiError, ApiResult};
use api_core::types::response::ResponseData;
use api_core::utils::vault_wrapper::{VaultWrapper, VwArgs};
use api_core::{decision, State};
use api_core::{task, ApiErrorKind};
use chrono::Utc;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::document_request::DocumentRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VerificationRequest;
use db::models::workflow::Workflow;
use newtypes::{
    DecisionIntentId, DecisionStatus, DocumentRequestKind, FpId, TenantId, Vendor, VendorAPI,
    VerificationRequestId, VerificationResultId, WorkflowId,
};
use std::str::FromStr;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct MakeVendorCallsRequest {
    pub wf_id: WorkflowId,
    pub vendor_api: VendorAPI,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct MakeVendorCallsResponse {
    new_vendor_request_ids: Vec<VerificationRequestId>,
    new_vendor_result_ids: Vec<VerificationResultId>,
    decision_output: DecisionOutput,
}

#[derive(Debug, Clone, serde::Serialize)]
struct DecisionOutput {
    pub decision_status: DecisionStatus,
    pub create_manual_review: bool,
    pub rules_triggered: String,
    pub rules_not_triggered: String,
}

impl From<OnboardingRulesDecisionOutput> for DecisionOutput {
    fn from(d: OnboardingRulesDecisionOutput) -> Self {
        let OnboardingRulesDecisionOutput {
            decision:
                Decision {
                    decision_status,
                    create_manual_review,
                    should_commit: _,
                },
            rules_triggered,
            rules_not_triggered,
        } = d;

        Self {
            decision_status,
            create_manual_review,
            rules_triggered: api_core::decision::rule::rules_to_string(&rules_triggered),
            rules_not_triggered: api_core::decision::rule::rules_to_string(&rules_not_triggered),
        }
    }
}

#[actix_web::post("/private/protected/risk/make_vendor_calls")]
async fn make_vendor_calls(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<MakeVendorCallsRequest>,
) -> actix_web::Result<Json<ResponseData<MakeVendorCallsResponse>>, ApiError> {
    let MakeVendorCallsRequest { wf_id, vendor_api } = request.into_inner();
    let (wf, sv) = state
        .db_pool
        .db_query(move |conn| Workflow::get_all(conn, &wf_id))
        .await??;
    let tid = sv.tenant_id.clone();
    let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.config, &state.enclave_client).await?;
    let tvc2 = tvc.clone();

    let wfid = wf.id.clone();
    let (requests, vw, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&sv.id))?;
            let decision_intent =
                DecisionIntent::create(conn, newtypes::DecisionIntentKind::ManualRunKyc, &sv.id, None)?;
            let requests = vendor::build_verification_requests_and_checkpoint(
                conn,
                &uvw,
                &sv.id,
                &decision_intent.id,
                &tvc2,
                vec![vendor_api],
            )?;

            let (obc, _) = ObConfiguration::get(conn, &wfid)?;

            Ok((requests, uvw, obc))
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
    .ok_or(ApiError::from(ApiErrorKind::VendorRequestsFailed))?;
    let rule_group = KycRuleGroup::default();
    let rules_output =
        api_core::decision::engine::calculate_decision(vendor_result.clone(), vw, obc, rule_group)?;

    Ok(Json(ResponseData::ok(MakeVendorCallsResponse {
        new_vendor_request_ids: vec![vendor_result.verification_request_id],
        new_vendor_result_ids: vec![vendor_result.verification_result_id],
        decision_output: rules_output.into(),
    })))
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct MakeDecisionRequest {
    pub tenant_id: TenantId,
    pub fp_id: FpId,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct MakeDecisionResponse {
    // ID's of the VerificationResult's used for the decision engine run
    vendor_result_ids: Vec<VerificationResultId>,
    // TODO: add OnboardingRulesDecisionOutput here
}

// TODO: rework these to use Workflows
#[post("/private/protected/risk/make_decision")]
async fn make_decision(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<MakeDecisionRequest>,
) -> actix_web::Result<Json<ResponseData<MakeDecisionResponse>>, ApiError> {
    let MakeDecisionRequest { tenant_id, fp_id } = request.into_inner();

    let (wf, vw, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, true))?;
            let wf = Workflow::get_active(conn, &scoped_user.id)?.ok_or(OnboardingError::NoWorkflow)?;

            let (obc, _) = ObConfiguration::get(conn, &wf.id)?;

            let vw = VaultWrapper::<_>::build(conn, VwArgs::Tenant(&wf.scoped_vault_id))?;

            Ok((wf, vw, obc))
        })
        .await?;

    let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
        &wf.scoped_vault_id,
        &state.db_pool,
        &state.enclave_client,
    )
    .await?;

    if !vendor_requests.outstanding_requests.is_empty() {
        return Err(AssertionError("Outstanding vendor requests found").into());
    }
    if vendor_requests.completed_requests.is_empty() {
        // Don't think this should ever be possible, but worth asserting
        return Err(AssertionError("No completed vendor requests found").into());
    }

    let vendor_result = vendor_requests
        .completed_requests
        .last()
        .cloned()
        .ok_or(ApiError::from(ApiErrorKind::VendorRequestsFailed))?;
    let vres_id = vendor_result.verification_result_id.clone();
    let risk_signals: RiskSignalGroupStruct<Kyc> =
        parse_reason_codes_from_vendor_result(vendor_result.clone(), vw, obc)?.kyc;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            save_risk_signals(conn, &wf.scoped_vault_id, &risk_signals, false)?;
            let rule_group = KycRuleGroup::default();
            let risk_signals = fetch_latest_risk_signals_map(conn, &wf.scoped_vault_id)?;
            let include_doc = DocumentRequest::get(conn, &wf.id, DocumentRequestKind::Identity)?.is_some();
            let config = KycRuleExecutionConfig {
                include_doc,
                document_only: false,
                skip_kyc: false,
                allow_stepup: true,
            };
            let rules_output = rule_group.evaluate(risk_signals, config)?;
            engine::save_onboarding_decision(
                conn,
                &wf,
                rules_output.final_kyc_decision()?.decision,
                vec![vres_id.clone()],
                vec![],
            )?;

            Ok(())
        })
        .await?;

    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    Ok(Json(ResponseData::ok(MakeDecisionResponse {
        vendor_result_ids: vec![vendor_result.verification_result_id],
    })))
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ShadowRunRequest {
    pub wf_id: WorkflowId,
    pub vendor_api: VendorAPI,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ShadowRunResult {
    decision_status: DecisionStatus, // TODO: add DecisionOutput when merged in
}

#[post("/private/protected/risk/shadow_run_vendor_calls_and_decisioning")]
async fn shadow_run(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<ShadowRunRequest>,
) -> actix_web::Result<Json<ResponseData<ShadowRunResult>>, ApiError> {
    let ShadowRunRequest { wf_id, vendor_api } = request.into_inner();
    let vendor_apis = vec![vendor_api];
    let (wf, sv) = state
        .db_pool
        .db_query(move |conn| Workflow::get_all(conn, &wf_id))
        .await??;
    let tid = sv.tenant_id.clone();
    let tvc = TenantVendorControl::new(tid, &state.db_pool, &state.config, &state.enclave_client).await?;

    let wfid = wf.id.clone();
    let (requests, vw, obc) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
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

            Ok((memory_only_requests, uvw, obc))
        })
        .await?;

    let vendor_results = decision::engine::make_vendor_requests(&state, tvc, requests, &wf.id).await?;

    let all_vendor_errors: Vec<&ApiError> = vendor_results.all_errors();
    if !all_vendor_errors.is_empty() {
        return Err(ApiErrorKind::AssertionError(format!(
            "Vendor call(s) failed: {:?}",
            &all_vendor_errors
        )))?;
    }

    // calculate_decision currently requires Vec<VendorResult> which we normally get from saving VerificationResult's to PG
    // since we want to keep things in-memory-only, we manually create VendorResult's here with dummy VerificationResultId's
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
        .ok_or(ApiError::from(ApiErrorKind::VendorRequestsFailed))?;
    let rule_group = KycRuleGroup::default();
    let rules_output = decision::engine::calculate_decision(vendor_result, vw, obc, rule_group)?;

    Ok(Json(ResponseData::ok(ShadowRunResult {
        decision_status: rules_output.decision.decision_status,
    })))
}
