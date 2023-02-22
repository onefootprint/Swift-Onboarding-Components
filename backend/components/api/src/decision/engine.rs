use crate::{
    enclave_client::EnclaveClient,
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    feature_flag::FeatureFlagClient,
    metrics,
    utils::user_vault_wrapper::{UserVaultWrapper, UvwArgs},
    State,
};

use super::{
    features::FeatureVector,
    risk::OnboardingRulesDecisionOutput,
    vendor::{vendor_result::VendorResult, vendor_trait::VendorAPICall},
    *,
};
use db::{
    models::{
        onboarding::Onboarding,
        user_vault::UserVault,
        verification_request::{RequestAndMaybeResult, VerificationRequest},
    },
    DbError, DbPool,
};
use idv::{
    idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest},
    socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest},
    twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request},
};

use newtypes::OnboardingId;
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

    let completed_outstanding_vendor_requests = make_vendor_requests(
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

    let all_vendor_results = vendor_requests
        .completed_requests
        .into_iter()
        .chain(completed_outstanding_vendor_requests.into_iter())
        .collect();

    // Calculate output from rules + features
    let (rules_output, features) = calculate_decision(all_vendor_results, ff_client, &ob.id)?;

    // Save/action/emit risk signals for the decision
    make_onboarding_decision(db_pool, ff_client, &ob.id, rules_output, features).await
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
    let uv = db_pool
        .db_query(move |conn| UserVault::get(conn, &obid))
        .await??;

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
) -> ApiResult<Vec<VendorResult>> {
    // Make requests
    let raw_results = vendor::make_request::make_vendor_requests(
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
    // TODO: This just fails if any vendor requests return errors. We should handle these appropriately somewhere!
    let has_errors = raw_results
    .iter()
    .filter_map(|r| r.as_ref().err())
    .find(|&err| match err {
        &ApiError::VendorRequestFailed(vendor_api) => {
            if utils::should_throw_error_in_decision_engine_if_error_in_request(&vendor_api) {
                true
            } else {
                tracing::warn!(vendor_api=%vendor_api, "Vendor request failed, but not bailing out of decision engine run");
                false
            }
        }
        _ => true,
    });

    if has_errors.is_some() {
        return Err(ApiError::VendorRequestsFailed);
    }

    let results = raw_results
        .into_iter()
        // We return early above if any fail, so this should not drop any results
        .filter_map(|r| r.ok())
        .collect();
    Ok(results)
}

/// Separate creating decision from saving decision. Used to "dry run" a decision before applying
pub fn calculate_decision(
    vendor_results: Vec<VendorResult>,
    ff_client: &impl FeatureFlagClient,
    onboarding_id: &OnboardingId,
) -> ApiResult<(OnboardingRulesDecisionOutput, FeatureVector)> {
    // From our results, create a FeatureVector for the final decision output
    let features = features::create_features(vendor_results);

    let decision = risk::evaluate_onboarding_rules(&features, onboarding_id.clone(), ff_client)?;

    Ok((decision, features))
}

/// Create and save an onboarding decision
pub async fn make_onboarding_decision(
    db_pool: &DbPool,
    ff_client: &impl FeatureFlagClient,
    onboarding_id: &OnboardingId,
    rules_output: OnboardingRulesDecisionOutput,
    features: FeatureVector,
) -> ApiResult<()> {
    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    let onboarding_decision =
        risk::save_final_decision(onboarding_id.clone(), features, db_pool, ff_client, rules_output).await?;

    let status = onboarding_decision.status.to_string();
    if let Ok(metric) =
        metrics::DECISION_ENGINE_ONBOARDING_DECISION.get_metric_with(&labels! {"status" => status.as_str()})
    {
        metric.inc();
    }

    Ok(())
}

type ShouldRunDecisionEngine = bool;

/// Determine if we are in a position to run IDV checks and produce a Decision. Otherwise, set up some testing data
#[tracing::instrument(skip(state, ob_config))]
pub async fn perform_pre_run_operations(
    state: &State,
    ob: Onboarding,
    ob_config: ObConfiguration,
) -> Result<ShouldRunDecisionEngine, ApiError> {
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::build(conn, UvwArgs::Tenant(&ob.scoped_user_id)))
        .await??;

    let should_initiate_verification_requests =
        utils::should_initiate_idv_or_else_setup_test_fixtures(state, uvw.clone(), ob.id.clone(), true)
            .await?;
    if !should_initiate_verification_requests {
        return Ok(false);
    }

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            // Can only start KYC checks for onboarding that has all required fields
            // Document Collection is handled synchronously in the frontend (to surface errors)
            let missing_attributes = uvw.missing_fields(&ob_config);
            if !missing_attributes.is_empty() {
                return Err(OnboardingError::MissingAttributes(missing_attributes.into()).into());
            }

            // Can only initiate IDV reqs one time for an onboarding
            // Once we set idv_reqs_initiated_at below, this lock will make sure we can't save multiple sets of VerificationRequests
            // and multiple decisions for an onboarding in a race condition (suppose we call /submit twice by accident)
            if ob.idv_reqs_initiated_at.is_some() {
                // In the case of a step up (for similar race condition related reasons) we notate on the OB whether we _do_ need
                // to produce a new decision, despite not needing to initiate verification requests again.
                if ob.decision_made_at.is_none() {
                    return Ok(());
                } else {
                    return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
                }
            }

            // Checkpoint and create VerificationRequests
            vendor::build_verification_requests_and_checkpoint(conn, &uvw, &ob.id)?;

            Ok(())
        })
        .await?;

    Ok(true)
}
