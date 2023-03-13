use std::collections::HashMap;

use crate::{
    enclave_client::EnclaveClient,
    errors::{ApiError, ApiResult},
    metrics,
};

use super::{
    features::FeatureVector,
    risk::OnboardingRulesDecisionOutput,
    vendor::{
        make_request::VerificationRequestWithVendorResponse, vendor_result::VendorResult,
        vendor_trait::VendorAPICall, verification_result,
    },
    *,
};
use db::{
    models::{
        onboarding::Onboarding,
        vault::Vault,
        verification_request::{RequestAndMaybeResult, VerificationRequest},
        verification_result::VerificationResult,
    },
    DbError, DbPool,
};
use either::Either;
use feature_flag::FeatureFlagClient;
use idv::{
    idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest},
    socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest},
    twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request},
};

use itertools::Itertools;
use newtypes::{OnboardingId, VerificationRequestId};
use prometheus::labels;
///
/// Run loads saved VerificationRequests and (potentially) VerificationResults and produces a Decision
#[allow(clippy::too_many_arguments)]
pub async fn run(
    ob: Onboarding,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    is_production: bool,
    ff_client: &impl FeatureFlagClient,
    idology_client: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: &impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
) -> ApiResult<()> {
    let vendor_requests =
        get_latest_verification_requests_and_results(&ob.id, db_pool, enclave_client).await?;

    let vendor_results = make_vendor_requests(
        db_pool,
        enclave_client,
        is_production,
        vendor_requests.outstanding_requests,
        ff_client,
        idology_client,
        socure_client,
        twilio_client,
    )
    .await?;

    // We want to always save the successful results even if some request has a hard error
    let completed_oustanding_vendor_responses =
        save_vendor_responses(db_pool, &vendor_results.successful, &ob.id).await?;

    // If required vendor calls failed, we cannot proceed with decisioning but we don't want to send a hard error to Bifrost so we short circuit here
    if !vendor_results.critical_errors.is_empty() {
        tracing::error!(
            errors = format!("{:?}", vendor_results.all_errors()),
            "VendorRequestsFailed"
        );
        return Ok(());
    }

    let all_vendor_results = vendor_requests
        .completed_requests
        .into_iter()
        .chain(completed_oustanding_vendor_responses.into_iter())
        .collect();

    // Calculate output from rules + features
    let (rules_output, features) = calculate_decision(all_vendor_results, ff_client)?;

    // Log decision output
    tracing::info!(
       rules_triggered=%rule::rules_to_string(&rules_output.rules_triggered),
       rules_not_triggered=%rule::rules_to_string(&rules_output.rules_not_triggered),
       create_manual_review=%rules_output.create_manual_review,
       decision=%rules_output.decision_status,
       onboarding_id=%ob.id,
       "{}", rule::CANONICAL_ONBOARDING_RULE_LINE,
    );

    // Save/action/emit risk signals for the decision
    make_onboarding_decision(db_pool, ff_client, &ob.id, rules_output, features, true).await
}

pub async fn save_vendor_responses(
    db_pool: &DbPool,
    vendor_responses: &[VerificationRequestWithVendorResponse],
    onboarding_id: &OnboardingId,
) -> ApiResult<Vec<VendorResult>> {
    let obid = onboarding_id.clone();
    let uv = db_pool.db_query(move |conn| Vault::get(conn, &obid)).await??;

    let mut verification_results: HashMap<VerificationRequestId, VerificationResult> =
        verification_result::save_verification_result(db_pool, vendor_responses, &uv.public_key)
            .await?
            .into_iter()
            .map(|vr| (vr.request_id.clone(), vr))
            .collect();

    let results: Vec<VendorResult> = vendor_responses
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
}

pub struct VendorRequests {
    pub completed_requests: Vec<VendorResult>,
    pub outstanding_requests: Vec<VerificationRequest>, // requests that we do not yet have results for
}

pub async fn get_latest_verification_requests_and_results(
    onboarding_id: &OnboardingId,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
) -> ApiResult<VendorRequests> {
    let obid = onboarding_id.clone();
    let requests_and_results = db_pool
        .db_query(move |conn| -> Result<Vec<RequestAndMaybeResult>, DbError> {
            // Load our requests and results
            // Importantly, this allows us to save VerificationRequests elsewhere in code and execute them here
            VerificationRequest::get_latest_requests_and_results_for_onboarding(conn, obid)
        })
        .await??;

    let obid = onboarding_id.clone();
    let uv = db_pool.db_query(move |conn| Vault::get(conn, &obid)).await??;

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
    pub non_critical_errors: Vec<ApiError>,
    pub critical_errors: Vec<ApiError>,
}

impl VendorResults {
    pub fn all_errors(&self) -> Vec<&ApiError> {
        self.critical_errors
            .iter()
            .chain(self.non_critical_errors.iter())
            .collect()
    }
}

fn partition_vendor_errors(
    raw_results: Vec<Result<VerificationRequestWithVendorResponse, ApiError>>,
) -> VendorResults {
    // TODO: This just fails if any vendor requests return errors. We should handle these appropriately somewhere!

    let (successful, errors): (Vec<VerificationRequestWithVendorResponse>, Vec<ApiError>) =
        raw_results.into_iter().partition_map(|r| match r {
            Ok(vr) => Either::Left(vr),
            Err(e) => Either::Right(e),
        });

    let (critical_errors, non_critical_errors) = errors.into_iter().partition(|e| {
        match e {
            &ApiError::VendorRequestFailed(vendor_api) => {
                if utils::should_throw_error_in_decision_engine_if_error_in_request(&vendor_api) {
                    true
                } else {
                    tracing::warn!(vendor_api=%vendor_api, "Vendor request failed, but not bailing out of decision engine run");
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
pub async fn make_vendor_requests(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    is_production: bool,
    requests: Vec<VerificationRequest>,
    ff_client: &impl FeatureFlagClient,
    idology_client: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: &impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
) -> ApiResult<VendorResults> {
    // Make requests
    let results = vendor::make_request::make_vendor_requests(
        requests,
        db_pool,
        enclave_client,
        is_production,
        ff_client,
        idology_client,
        socure_client,
        twilio_client,
    )
    .await?;

    Ok(partition_vendor_errors(results))
}

/// Separate creating decision from saving decision. Used to "dry run" a decision before applying
pub fn calculate_decision(
    vendor_results: Vec<VendorResult>,
    ff_client: &impl FeatureFlagClient,
) -> ApiResult<(OnboardingRulesDecisionOutput, FeatureVector)> {
    // From our results, create a FeatureVector for the final decision output
    let features = features::create_features(vendor_results);

    let decision = risk::evaluate_onboarding_rules(&features, ff_client)?;

    Ok((decision, features))
}

/// Create and save an onboarding decision
pub async fn make_onboarding_decision(
    db_pool: &DbPool,
    ff_client: &impl FeatureFlagClient,
    onboarding_id: &OnboardingId,
    rules_output: OnboardingRulesDecisionOutput,
    features: FeatureVector,
    assert_is_first_decision_for_onboarding: bool,
) -> ApiResult<()> {
    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    let onboarding_decision = risk::save_final_decision(
        onboarding_id.clone(),
        features,
        db_pool,
        ff_client,
        rules_output,
        assert_is_first_decision_for_onboarding,
    )
    .await?;

    let status = onboarding_decision.status.to_string();
    if let Ok(metric) =
        metrics::DECISION_ENGINE_ONBOARDING_DECISION.get_metric_with(&labels! {"status" => status.as_str()})
    {
        metric.inc();
    }

    Ok(())
}
