use crate::{
    enclave_client::EnclaveClient,
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    feature_flag::FeatureFlagClient,
    metrics,
    utils::user_vault_wrapper::{UserVaultWrapper, UvwArgs},
    State,
};

use super::{
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
    let all_vendor_results = make_outstanding_vendor_requests(
        &ob.id,
        db_pool,
        enclave_client,
        is_production,
        ff_client,
        idology_client,
        socure_client,
        twilio_client,
    )
    .await?;
    make_onboarding_decision(all_vendor_results, db_pool, ff_client, &ob.id).await
}

#[allow(clippy::too_many_arguments)]
pub async fn make_outstanding_vendor_requests(
    onboarding_id: &OnboardingId,
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
) -> ApiResult<Vec<VendorResult>> {
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
        .chain(previous_results.into_iter())
        .collect();

    Ok(results)
}

pub async fn make_onboarding_decision(
    vendor_results: Vec<VendorResult>,
    db_pool: &DbPool,
    ff_client: &impl FeatureFlagClient,
    onboarding_id: &OnboardingId,
) -> ApiResult<()> {
    // From our results, create a FeatureVector for the final decision output
    let features = features::create_features(vendor_results);

    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    // TODO: breakup create_final_decision into 1 func that creates DecisionOutput and 1 func that actually writes an OBD (+risksignals) from that
    //       onboading_id is only currently needed for the first part in logging in the rules, but we should be able to remove and put that logging outside
    let onboarding_decision =
        risk::create_final_decision(onboarding_id.clone(), features, db_pool, ff_client).await?;

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

            // Checkpoint and create VerificationRequests
            vendor::build_verification_requests_and_checkpoint(conn, &uvw, &ob.id)?;

            Ok(true)
        })
        .await?;

    Ok(true)
}
