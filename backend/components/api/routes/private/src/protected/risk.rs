use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::decision::vendor;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use crate::{decision, State};
use actix_web::post;
use actix_web::web::{self, Json};
use api_core::decision::engine;
use api_core::decision::features::risk_signals::{
    create_risk_signals_from_vendor_results, fetch_latest_risk_signals_map, save_risk_signals,
};
use api_core::decision::onboarding::rules::KycRuleExecutionConfig;
use api_core::decision::onboarding::{rules::KycRuleGroup, Decision, OnboardingRulesDecisionOutput};
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::decision::vendor::vendor_api::vendor_api_response::build_vendor_response_map_from_vendor_results;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::AssertionError;
use api_core::{task, ApiErrorKind};
use chrono::Utc;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::document_request::DocumentRequest;
use db::models::onboarding::Onboarding;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VerificationRequest;
use db::models::workflow::Workflow;
use newtypes::{
    DecisionIntentId, DecisionStatus, FpId, TenantId, Vendor, VerificationRequestId, VerificationResultId,
};
use std::str::FromStr;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct MakeVendorCallsRequest {
    pub tenant_id: TenantId,
    pub fp_id: FpId,
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
                    vendor_api: _,
                },
            rules_triggered,
            rules_not_triggered,
        } = d;

        Self {
            decision_status,
            create_manual_review,
            rules_triggered: crate::decision::rule::rules_to_string(&rules_triggered),
            rules_not_triggered: crate::decision::rule::rules_to_string(&rules_not_triggered),
        }
    }
}

#[actix_web::post("/private/protected/risk/make_vendor_calls")]
async fn make_vendor_calls(
    state: web::Data<State>,
    _: ProtectedCustodianAuthContext,
    request: Json<MakeVendorCallsRequest>,
) -> actix_web::Result<Json<ResponseData<MakeVendorCallsResponse>>, ApiError> {
    let MakeVendorCallsRequest { tenant_id, fp_id } = request.into_inner();
    let tid = tenant_id.clone();
    let tenant_vendor_control =
        TenantVendorControl::new(tid, &state.db_pool, &state.config, &state.enclave_client).await?;
    let tenant_vendor_control2 = tenant_vendor_control.clone();

    let (requests, ob) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, true))?;
            let (ob, _, _, _) = Onboarding::get(conn, &scoped_user.id)?;

            let uvw = VaultWrapper::build(conn, VwArgs::Tenant(&scoped_user.id))?;

            let decision_intent = DecisionIntent::create(
                conn,
                newtypes::DecisionIntentKind::ManualRunKyc,
                &scoped_user.id,
                None,
            )?;
            let requests = vendor::build_verification_requests_and_checkpoint(
                conn,
                &uvw,
                &scoped_user.id,
                &decision_intent.id,
                &tenant_vendor_control2,
            )?;

            Ok((requests, ob))
        })
        .await?;

    let vendor_results = decision::engine::make_vendor_requests(
        &state.db_pool,
        &ob.id,
        &state.enclave_client,
        state.config.service_config.is_production(),
        requests,
        state.feature_flag_client.clone(),
        state.vendor_clients.idology_expect_id.clone(),
        state.vendor_clients.socure_id_plus.clone(),
        state.vendor_clients.twilio_lookup_v2.clone(),
        state.vendor_clients.experian_cross_core.clone(),
        tenant_vendor_control,
    )
    .await?;

    if !vendor_results.critical_errors.is_empty() {
        return Err(ApiErrorKind::VendorRequestsFailed)?;
    }

    let vendor_results = decision::engine::save_vendor_responses(
        &state.db_pool,
        &vendor_results.successful,
        vendor_results.all_errors_with_parsable_requests(),
        &ob.id,
    )
    .await?;
    let rule_group = KycRuleGroup::default();
    let rules_output = crate::decision::engine::calculate_decision(vendor_results.clone(), rule_group)?;

    let (request_ids, response_ids): (Vec<VerificationRequestId>, Vec<VerificationResultId>) = vendor_results
        .into_iter()
        .map(|r| (r.verification_request_id, r.verification_result_id))
        .unzip();

    Ok(Json(ResponseData::ok(MakeVendorCallsResponse {
        new_vendor_request_ids: request_ids,
        new_vendor_result_ids: response_ids,
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
    _: ProtectedCustodianAuthContext,
    request: Json<MakeDecisionRequest>,
) -> actix_web::Result<Json<ResponseData<MakeDecisionResponse>>, ApiError> {
    let MakeDecisionRequest { tenant_id, fp_id } = request.into_inner();

    let (ob, is_sandbox, wf) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, true))?;
            let (ob, _, _, _) = Onboarding::get(conn, &scoped_user.id)?;
            let is_sandbox = !scoped_user.is_live;
            let wf = Workflow::latest(conn, &scoped_user.id)?.ok_or(OnboardingError::NoWorkflow)?;
            Ok((ob, is_sandbox, wf))
        })
        .await?;

    let vendor_requests = decision::engine::get_latest_verification_requests_and_results(
        &ob.id,
        &ob.scoped_vault_id,
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

    let vendor_results: Vec<VendorResult> = vendor_requests.completed_requests;
    let vendor_result_maps = build_vendor_response_map_from_vendor_results(&vendor_results)?;
    let verification_result_ids: Vec<VerificationResultId> = vendor_results
        .iter()
        .map(|vr| vr.verification_result_id.clone())
        .collect();
    let vendor_result_ids = verification_result_ids.clone();
    let risk_signals = create_risk_signals_from_vendor_results(vendor_result_maps)?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            save_risk_signals(conn, &ob.scoped_vault_id, &risk_signals, false)?;
            let rule_group = KycRuleGroup::default();
            let risk_signals = fetch_latest_risk_signals_map(conn, &ob.scoped_vault_id)?;
            let include_doc = DocumentRequest::get(conn, &wf.id)?.is_some();
            let config = KycRuleExecutionConfig {
                include_doc,
                document_only: false,
            };
            let rules_output = rule_group.evaluate(risk_signals, config)?;
            engine::save_onboarding_decision(
                conn,
                &ob,
                rules_output.into(),
                verification_result_ids,
                is_sandbox,
                Some(&wf),
                vec![],
            )?;

            Ok(())
        })
        .await?;

    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    Ok(Json(ResponseData::ok(MakeDecisionResponse { vendor_result_ids })))
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct ShadowRunRequest {
    pub tenant_id: TenantId,
    pub fp_id: FpId,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ShadowRunResult {
    decision_status: DecisionStatus, // TODO: add DecisionOutput when merged in
}

#[post("/private/protected/risk/shadow_run_vendor_calls_and_decisioning")]
async fn shadow_run(
    state: web::Data<State>,
    _: ProtectedCustodianAuthContext,
    request: Json<ShadowRunRequest>,
) -> actix_web::Result<Json<ResponseData<ShadowRunResult>>, ApiError> {
    let ShadowRunRequest { tenant_id, fp_id } = request.into_inner();

    let tid = tenant_id.clone();
    let tenant_vendor_control =
        TenantVendorControl::new(tid, &state.db_pool, &state.config, &state.enclave_client).await?;
    let tenant_vendor_control2 = tenant_vendor_control.clone();

    let (ob, requests) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, true))?;
            let (ob, _, _, _) = Onboarding::get(conn, &scoped_user.id)?;
            let uvw: VaultWrapper<Person> = VaultWrapper::build(conn, VwArgs::Tenant(&scoped_user.id))?;
            let seqno = DataLifetime::get_current_seqno(conn)?;

            let vendor_apis = vendor::get_vendor_apis_for_verification_requests(
                uvw.populated().as_slice(),
                &tenant_vendor_control2,
            )?;
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
                    scoped_vault_id: scoped_user.id.clone(),
                    decision_intent_id: DecisionIntentId::from_str("fake in-memory-only DecisionIntent")
                        .unwrap(),
                })
                .collect();

            Ok((ob, memory_only_requests))
        })
        .await?;

    let vendor_results = decision::engine::make_vendor_requests(
        &state.db_pool,
        &ob.id,
        &state.enclave_client,
        state.config.service_config.is_production(),
        requests,
        state.feature_flag_client.clone(),
        state.vendor_clients.idology_expect_id.clone(),
        state.vendor_clients.socure_id_plus.clone(),
        state.vendor_clients.twilio_lookup_v2.clone(),
        state.vendor_clients.experian_cross_core.clone(),
        tenant_vendor_control,
    )
    .await?;

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
    let vendor_results = vendor_results
        .successful
        .into_iter()
        .map(|(req, res)| VendorResult {
            response: res,
            verification_result_id: VerificationResultId::from_str("fake in-memory-only VerificationResult")
                .unwrap(),
            verification_request_id: req.id,
        })
        .collect();
    let rule_group = KycRuleGroup::default();
    let rules_output = decision::engine::calculate_decision(vendor_results, rule_group)?;

    Ok(Json(ResponseData::ok(ShadowRunResult {
        decision_status: rules_output.decision.decision_status,
    })))
}
