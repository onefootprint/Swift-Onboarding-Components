use crate::{
    errors::{onboarding::OnboardingError, ApiError},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

use db::models::{onboarding::Onboarding, verification_request::VerificationRequest};
use newtypes::{OnboardingStatus, TenantId, UserVaultId, Vendor, VendorAPI};

use super::{verification_request::build_request, *};
/// The Engine module is the main entry point into running our verification logic
///
///
/// It's an assemblage of several pieces
/// - converting UVW (and other) data into VerificationRequests
///    - checkpointing these to the database
/// - routing and sending those VRs to vendors
/// - Processing the results
/// - Emitting AuditTrail events
/// - test/demo data
/// - producing decisions
pub async fn run(
    state: &State,
    uvw_id: UserVaultId,
    ob_config: ObConfiguration,
    tenant_id: TenantId,
) -> Result<(), ApiError> {
    // initialize some variables since we have a lot of closures that move ownership below
    let uvwid = uvw_id.clone();
    let tenantid: TenantId = tenant_id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &uvwid))
        .await??;
    // Check if the user is a sandbox user. Sandbox users have the final KYC state encoded in their
    // phone number's sandbox suffix
    let desired_status = utils::get_desired_status_for_testing(state, &uvw).await?;

    // Build our VerificationRequests and save outputs
    let (requests, ob_id) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (ob, _) = Onboarding::lock_by_config(conn, &uvw.user_vault.id, &ob_config.id)?
                .ok_or(OnboardingError::NoOnboarding)?;
            // Can only start KYC checks for onboarding that has all required fields
            let missing_attributes = uvw.missing_fields(&ob_config);
            if !missing_attributes.is_empty() {
                return Err(OnboardingError::MissingAttributes(missing_attributes).into());
            }
            // Can only start KYC checks for onboardings whose KYC checks have not yet been started
            if ob.status != OnboardingStatus::New {
                return Err(OnboardingError::WrongKycState(ob.status).into());
            }
            let ob_id = ob.id.clone();

            // From the data in the vault, figure out which vendors we need to send to
            let available_vendor_apis = user_vault_helper::get_vendor_apis_from_user_vault_wrapper(&uvw)?;
            // From the possible vendors, select which ones we're sending to (logic TBD)
            let vendor_apis = verification_request::choose_vendor_apis(available_vendor_apis);

            let requests = verification_request::build_verification_requests_and_checkpoint(
                conn,
                ob,
                &uvw,
                &tenantid,
                desired_status,
                vendor_apis,
            )?;
            Ok((requests, ob_id))
        })
        .await?;

    // Build our IDV Vendor requests
    let future_results = requests.into_iter().map(|r| make_idv_request(state, r));

    // Make requests
    // TODO: if any of the requests fail, this joined future will fail. Handle individual vendor failures separately
    let results = futures::future::try_join_all(future_results).await?;

    // From our results, create a FeatureVector for the final decision output
    let features = features::create_features(results);

    // Create our final decision from the features we created, set final onboarding status, and emit risk signals
    risk::create_final_decision(state, ob_id, features).await?;

    Ok(())
}

async fn make_idv_request(
    state: &State,
    request: VerificationRequest,
) -> Result<vendor_result::VendorResult, ApiError> {
    let request_id = request.id.clone();

    // TODO: could have different logic for different vendors?
    let data =
        verification_request::build_request::build_idv_data_from_verification_request(state, request.clone())
            .await?;

    // TODO: mark requirement statuses as fulfilled. I don't totally like it going in here but it's ok for now
    // TODO: handle collect doc - remove?
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
