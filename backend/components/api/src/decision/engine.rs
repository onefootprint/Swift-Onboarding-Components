use crate::{
    errors::{onboarding::OnboardingError, ApiError},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

use db::models::{onboarding::Onboarding, verification_request::VerificationRequest};
use newtypes::{OnboardingId, OnboardingStatus, UserVaultId};

use super::{vendor_result::VendorResult, *};
/// The Engine module is the main entry point into running our verification logic
///
///
/// It's an assemblage of several pieces
/// - converting UVW (and other) data into VerificationRequests
///    - checkpointing these to the database
/// - routing and sending those VRs to vendors
/// - Processing the results
/// - Emitting UserTimeline events
/// - test/demo data
/// - producing decisions
pub async fn decide(state: &State, uv_id: UserVaultId, ob: Onboarding) -> Result<(), ApiError> {
    // initialize some variables since we have a lot of closures that move ownership below
    let uvwid = uv_id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &uvwid))
        .await??;

    // Check if the user is a sandbox user. Sandbox users have the final KYC state encoded in their
    // phone number's sandbox suffix
    let should_initiate_verification_requests =
        utils::should_initiate_idv_or_else_setup_test_fixtures(state, uvw.clone(), ob.id.clone()).await?;
    if !should_initiate_verification_requests {
        return Ok(());
    }

    // Build our VerificationRequests and save outputs
    let (requests, ob_id, previous_results) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let ob_id = ob.id.clone();

            // Unconditionally set the onboarding status to Pending to checkpoint and create VerificationRequests
            let requests = verification_request::build_verification_requests_and_checkpoint(conn, ob, &uvw)?;

            // Load our requests and results
            // Importantly, this allows us to save VerificationRequests elsewhere in code and execute them here
            let requests_and_results =
                VerificationRequest::get_requests_and_results_for_onboarding(conn, ob_id.clone())?;
            // TODO: we should run any dangling VerificationRequests here
            // In the case we have already run some verifications for this onboarding, create our previous VendorResults
            let previous_results =
                VendorResult::from_verification_results_for_onboarding(requests_and_results)?;

            Ok((requests, ob_id, previous_results))
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

/// Determine if we are in a position to produce a decision.
/// This is intimately tied to how the frontend is rendered
pub async fn can_decide(
    state: &State,
    uvw_id: UserVaultId,
    ob_id: OnboardingId,
    ob_config: ObConfiguration,
) -> Result<(), ApiError> {
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let uvw = UserVaultWrapper::get(conn, &uvw_id)?;
            // TODO this lock doesn't do anything right now. Fix race condition
            let ob = Onboarding::lock(conn, &ob_id)?;

            // Can only start KYC checks for onboarding that has all required fields
            // Document Collection is handled synchronously in the frontend (to surface errors)
            let missing_attributes = uvw.missing_fields(&ob_config);
            if !missing_attributes.is_empty() {
                return Err(OnboardingError::MissingAttributes(missing_attributes).into());
            }
            // Can only start KYC checks for onboardings whose KYC checks have not yet been started
            if ob.status != OnboardingStatus::New {
                return Err(OnboardingError::WrongKycState(ob.status).into());
            }
            Ok(())
        })
        .await?;

    Ok(())
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
