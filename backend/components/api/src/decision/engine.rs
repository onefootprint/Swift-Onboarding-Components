use crate::{
    errors::{onboarding::OnboardingError, ApiError},
    utils::user_vault_wrapper::{UserVaultWrapper, UvwArgs},
    State,
};

use db::models::{onboarding::Onboarding, verification_request::VerificationRequest};

use super::*;
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
                vendor::vendor_result::VendorResult::from_verification_results_for_onboarding(
                    requests_and_results.clone(),
                )?;
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

    // Make requests
    let raw_results = vendor::make_request::make_vendor_requests(state, requests).await?;
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

    // From our results, create a FeatureVector for the final decision output
    let features = features::create_features(results);

    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    risk::create_final_decision(state, ob_id, features).await?;

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
                return Err(OnboardingError::MissingAttributes(missing_attributes).into());
            }

            // Checkpoint and create VerificationRequests
            vendor::build_verification_requests_and_checkpoint(conn, &uvw, &ob.id)?;

            Ok(true)
        })
        .await?;

    Ok(true)
}
