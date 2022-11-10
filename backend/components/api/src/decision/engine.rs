use crate::{
    errors::{onboarding::OnboardingError, ApiError},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

use db::models::{onboarding::Onboarding, verification_request::VerificationRequest};
use newtypes::{OnboardingId, UserVaultId};

use super::{vendor_result::VendorResult, *};
/// The Engine module is the main entry point into running our verification logic
///
///
/// Run loads saved VerificationRequests and (potentially) VerificationResults and produces a Decision
pub async fn run(state: &State, ob: Onboarding) -> Result<(), ApiError> {
    // TODO: Move check `initiated`
    // See https://www.notion.so/Statuses-v2-461c189437c148b085bc666c596546a9

    let (requests, ob_id, previous_results) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            // Load our requests and results
            // Importantly, this allows us to save VerificationRequests elsewhere in code and execute them here
            let requests_and_results =
                VerificationRequest::get_requests_and_results_for_onboarding(conn, ob.id.clone())?;
            // In the case we have already run some verifications for this onboarding, create our previous VendorResults
            let previous_results =
                VendorResult::from_verification_results_for_onboarding(requests_and_results.clone())?;
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
            Ok((requests, ob.id, previous_results))
        })
        .await?;

    // Build our IDV Vendor requests
    let future_results = requests.into_iter().map(|r| make_idv_request(state, r));

    // Make requests
    // TODO: if any of the requests fail, this joined future will fail. Handle individual vendor failures separately
    let results = futures::future::try_join_all(future_results)
        .await?
        .into_iter()
        .chain(previous_results.into_iter())
        .collect();

    // From our results, create a FeatureVector for the final decision output
    let features = features::create_features(results);

    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    risk::create_final_decision(state, ob_id, features).await?;

    Ok(())
}

type ShouldRunDecisionEngine = bool;

/// Determine if we are in a position to run IDV checks and produce a Decision. Otherwise, set up some testing data
pub async fn perform_pre_run_operations(
    state: &State,
    uvw_id: UserVaultId,
    ob_id: OnboardingId,
    ob_config: ObConfiguration,
) -> Result<ShouldRunDecisionEngine, ApiError> {
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &uvw_id))
        .await??;

    // Check if the user is a sandbox user. Sandbox users have the final KYC state encoded in their
    // phone number's sandbox suffix
    let should_initiate_verification_requests =
        utils::should_initiate_idv_or_else_setup_test_fixtures(state, uvw.clone(), ob_id.clone()).await?;
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
                return Err(OnboardingError::MissingAttributes(missing_attributes).into());
            }

            // Checkpoint and create VerificationRequests
            verification_request::build_verification_requests_and_checkpoint(conn, &ob_id, &uvw)?;

            Ok(true)
        })
        .await?;

    Ok(true)
}

/// Make our requests to a vendor, building data from the cached VerificationRequest
async fn make_idv_request(
    state: &State,
    request: VerificationRequest,
) -> Result<vendor_result::VendorResult, ApiError> {
    let request_id = request.id.clone();

    let data =
        verification_request::build_request::build_idv_data_from_verification_request(state, request.clone())
            .await?;

    let vendor_response = verification_request::make_request::send_idv_request(state, request, data).await?;

    let verification_result =
        verification_result::save_verification_result(state, request_id.clone(), vendor_response.clone())
            .await?;

    let result = vendor_result::VendorResult {
        response: vendor_response,
        verification_result_id: verification_result.id,
        verification_request_id: request_id,
    };

    Ok(result)
}
