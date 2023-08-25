use std::collections::HashMap;

use super::{
    features::risk_signals::{create_risk_signals_from_vendor_results, RiskSignalsForDecision},
    onboarding::{
        rules::{KycRuleExecutionConfig, KycRuleGroup},
        FinalAndAdditionalDecisions, OnboardingRulesDecision, OnboardingRulesDecisionOutput,
    },
    vendor::{
        make_request::{VerificationRequestWithVendorError, VerificationRequestWithVendorResponse},
        tenant_vendor_control::TenantVendorControl,
        vendor_api::vendor_api_response::build_vendor_response_map_from_vendor_results,
        vendor_result::VendorResult,
        verification_result,
    },
    *,
};
use crate::{
    enclave_client::EnclaveClient,
    errors::{ApiError, ApiErrorKind, ApiResult},
    metrics,
    utils::vault_wrapper::VaultWrapper,
    State,
};
use db::{
    models::{
        ob_configuration::ObConfiguration,
        vault::Vault,
        verification_request::{RequestAndMaybeResult, VerificationRequest},
        verification_result::VerificationResult,
        workflow::Workflow,
    },
    DbError, DbPool, TxnPgConn,
};
use either::Either;

use itertools::Itertools;
use newtypes::{
    PiiJsonValue, ReviewReason, ScopedVaultId, VerificationRequestId, VerificationResultId, WorkflowId,
};
use prometheus::labels;

pub async fn save_vendor_responses(
    db_pool: &DbPool,
    vendor_responses: &[VerificationRequestWithVendorResponse],
    vendor_error_responses: Vec<(VerificationRequest, Option<PiiJsonValue>)>,
    wf_id: &WorkflowId,
) -> ApiResult<Vec<VendorResult>> {
    let wf_id = wf_id.clone();

    let responses = vendor_responses.to_owned();
    let results = db_pool
        .db_transaction(move |conn| -> ApiResult<Vec<VendorResult>> {
            let (_, uv) = Workflow::get_with_vault(conn, &wf_id)?;
            let vres = verification_result::save_verification_results(conn, &responses, &uv.public_key)?;
            verification_result::save_error_verification_results(
                conn,
                &vendor_error_responses,
                &uv.public_key,
            )?; // Match on errors that are parsable

            let mut verification_results: HashMap<VerificationRequestId, VerificationResult> =
                vres.into_iter().map(|vr| (vr.request_id.clone(), vr)).collect();

            let results: Vec<VendorResult> = responses
                .iter()
                .map(|(req, res)| -> ApiResult<VendorResult> {
                    let verification_result = verification_results
                        .remove(&req.id)
                        .ok_or(DbError::RelatedObjectNotFound)?;

                    Ok(VendorResult {
                        response: res.clone(),
                        verification_result_id: verification_result.id,
                        verification_request_id: req.id.clone(),
                    })
                })
                .collect::<Result<Vec<VendorResult>, _>>()?;
            Ok(results)
        })
        .await?;
    Ok(results)
}

pub struct VendorRequests {
    pub completed_requests: Vec<VendorResult>,
    pub outstanding_requests: Vec<VerificationRequest>, // requests that we do not yet have results for
}

#[tracing::instrument(skip(db_pool, enclave_client))]
pub async fn get_latest_verification_requests_and_results(
    scoped_user_id: &ScopedVaultId,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
) -> ApiResult<VendorRequests> {
    let suid = scoped_user_id.clone();
    let requests_and_results = db_pool
        .db_query(move |conn| -> Result<Vec<RequestAndMaybeResult>, DbError> {
            // Load our requests and results
            // Importantly, this allows us to save VerificationRequests elsewhere in code and execute them here
            VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user(conn, suid)
        })
        .await??;

    let su_id = scoped_user_id.clone();
    let uv = db_pool.db_query(move |conn| Vault::get(conn, &su_id)).await??;

    let previous_results = vendor::vendor_result::VendorResult::from_verification_results_for_onboarding(
        requests_and_results.clone(),
        enclave_client,
        &uv.e_private_key,
    )
    .await?;

    let requests: Vec<VerificationRequest> = requests_and_results
        .into_iter()
        .filter_map(|(request, result)| {
            // Only send requests for which we don't already have a result
            if result.is_none() {
                Some(request)
            } else {
                None
            }
        })
        .collect();

    Ok(VendorRequests {
        completed_requests: previous_results,
        outstanding_requests: requests,
    })
}

pub struct VendorResults {
    pub successful: Vec<VerificationRequestWithVendorResponse>,
    pub non_critical_errors: Vec<VerificationRequestWithVendorError>,
    pub critical_errors: Vec<VerificationRequestWithVendorError>,
}

impl VendorResults {
    pub fn all_errors(&self) -> Vec<&ApiError> {
        self.critical_errors
            .iter()
            .chain(self.non_critical_errors.iter())
            .map(|(_, e)| e)
            .collect()
    }

    pub fn all_errors_with_parsable_requests(&self) -> Vec<(VerificationRequest, Option<PiiJsonValue>)> {
        self.critical_errors
            .iter()
            .map(Self::construct_requests_with_responses_for_verification_result)
            .chain(
                self.non_critical_errors
                    .iter()
                    .map(Self::construct_requests_with_responses_for_verification_result),
            )
            .collect()
    }

    pub fn has_sufficient_results_for_kyc(&self) -> bool {
        self.successful.iter().any(|(vreq, _)| {
            matches!(
                vreq.vendor_api,
                VendorAPI::IdologyExpectID | VendorAPI::ExperianPreciseID
            )
        })
    }
}

impl VendorResults {
    fn construct_requests_with_responses_for_verification_result(
        v: &VerificationRequestWithVendorError,
    ) -> (VerificationRequest, Option<PiiJsonValue>) {
        match (&v.0, v.1.kind()) {
            (req, ApiErrorKind::VendorRequestFailed(ve)) => match &ve.error {
                idv::Error::IDologyError(idv::idology::error::Error::ErrorWithResponse(e)) => {
                    (req.clone(), Some(e.response.clone()))
                }
                idv::Error::ExperianError(idv::experian::error::Error::ErrorWithResponse(e)) => {
                    (req.clone(), Some(e.response.clone()))
                }
                // TODO: non-ideal to have empty json, should make response optional
                _ => (req.clone(), None),
            },
            (req, _) => (req.clone(), None),
        }
    }
}

fn partition_vendor_errors(
    raw_results: Vec<Result<VerificationRequestWithVendorResponse, VerificationRequestWithVendorError>>,
) -> VendorResults {
    // TODO: This just fails if any vendor requests return errors. We should handle these appropriately somewhere!

    let (successful, errors): (
        Vec<VerificationRequestWithVendorResponse>,
        Vec<VerificationRequestWithVendorError>,
    ) = raw_results.into_iter().partition_map(|r| match r {
        Ok(vr) => Either::Left(vr),
        Err(e) => Either::Right(e),
    });

    let (critical_errors, non_critical_errors) = errors.into_iter().partition(|(_, e)| {
        match e.kind() {
            ApiErrorKind::VendorRequestFailed(vendor_api_error) => {
                if utils::should_throw_error_in_decision_engine_if_error_in_request(&vendor_api_error.vendor_api) {
                    true
                } else {
                    tracing::warn!(vendor_api=%&vendor_api_error.vendor_api, "Vendor request failed, but not bailing out of decision engine run");
                    false
                }
            }
            _ => true,
        }
    });

    VendorResults {
        successful,
        non_critical_errors,
        critical_errors,
    }
}

#[allow(clippy::too_many_arguments)]
#[tracing::instrument(skip_all)]
pub async fn make_vendor_requests(
    state: &State,
    tvc: TenantVendorControl,
    requests: Vec<VerificationRequest>,
    wf_id: &WorkflowId,
) -> ApiResult<VendorResults> {
    // Make requests
    let results = vendor::make_request::make_vendor_requests(state, tvc, requests, wf_id).await?;

    Ok(partition_vendor_errors(results))
}

/// Separate creating decision from saving decision. Used to "dry run" a decision before applying
pub fn calculate_decision(
    vendor_results: Vec<VendorResult>,
    vw: VaultWrapper,
    obc: ObConfiguration,
    rule_group: KycRuleGroup,
) -> ApiResult<OnboardingRulesDecisionOutput> {
    let vendor_result_maps = build_vendor_response_map_from_vendor_results(&vendor_results)?;
    let risk_signals = RiskSignalsForDecision {
        kyc: Some(create_risk_signals_from_vendor_results(
            vendor_result_maps,
            vw,
            obc,
        )?),
        ..Default::default()
    };
    let decision = rule_group.evaluate(
        risk_signals,
        KycRuleExecutionConfig {
            include_doc: false,
            document_only: false,
        },
    )?;

    decision.final_kyc_decision()
}

/// Create and save an onboarding decision
#[allow(clippy::too_many_arguments)]
pub fn save_onboarding_decision(
    conn: &mut TxnPgConn,
    workflow: &Workflow,
    rules_output: OnboardingRulesDecision,
    verification_result_ids: Vec<VerificationResultId>,
    is_sandbox: bool,
    review_reasons: Vec<ReviewReason>,
) -> ApiResult<()> {
    let (final_decision, additional_evaluated) = rules_output.final_decision_and_additional_evaluated()?;
    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    risk::save_final_decision(
        conn,
        workflow.id.clone(),
        verification_result_ids,
        &final_decision.decision,
        review_reasons,
    )?;

    let status = final_decision.decision.decision_status.to_string();
    if let Ok(metric) =
        metrics::DECISION_ENGINE_ONBOARDING_DECISION.get_metric_with(&labels! {"status" => status.as_str()})
    {
        metric.inc();
    }

    if !is_sandbox {
        // Log our canonical line
        log_rule_evaluation(workflow, &final_decision, rule::CANONICAL_ONBOARDING_RULE_LINE);

        // Log any additional decisions
        additional_evaluated
            .into_iter()
            .for_each(|output| log_rule_evaluation(workflow, &output, "additional_decisions_for_onboarding"));
    }

    Ok(())
}

fn log_rule_evaluation(wf: &Workflow, rule_output: &OnboardingRulesDecisionOutput, msg: &str) {
    tracing::info!(
       rules_triggered=%rule::rules_to_string(&rule_output.rules_triggered),
       rules_not_triggered=%rule::rules_to_string(&rule_output.rules_not_triggered),
       create_manual_review=%rule_output.decision.create_manual_review,
       decision=%rule_output.decision.decision_status,
       workflow_id=%wf.id,
       scoped_user_id=%wf.scoped_vault_id,
       vendor_api=%rule_output.decision.vendor_api,
       msg
       // TODO: differentiate KYB vs KYC here
    );
}
