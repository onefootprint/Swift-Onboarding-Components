use crate::{
    errors::{onboarding::OnboardingError, ApiError},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

use db::models::{onboarding::Onboarding, verification_request::VerificationRequest};
use newtypes::{OnboardingStatus, TenantId, UserVaultId, Vendor};

use super::*;
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
    let vendors = vec![Vendor::Idology, Vendor::Twilio];

    // Build our VerificationRequests and save outputs
    let (requests, ob_id) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (ob, _) = Onboarding::lock_by_config(conn, &uvw.user_vault.id, &ob_config.id)?
                .ok_or(OnboardingError::NoOnboarding)?;
            // Can only start KYC checks for onboardings whose KYC checks have not yet been started
            if ob.status != OnboardingStatus::New {
                return Err(OnboardingError::WrongKycState(ob.status).into());
            }
            let ob_id = ob.id.clone();
            // We need to figure out which vendors to send which pieces of data...
            let requests = verification_request::build_verification_requests_and_checkpoint(
                conn,
                ob,
                &uvw,
                &tenantid,
                desired_status,
                vendors,
            )?;
            Ok((requests, ob_id))
        })
        .await?;

    // Fire off all IDV requests. Now that the requests are saved in the DB, even if we crash here,
    // we know where to continue processing.
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &uvw_id))
        .await??;
    // TODO: Figure out which requirements are present and save to junction table
    // Try to make this in one DB transaction, which I think means we should bulk create outside the closure, but
    // it may require more refactoring

    let future_results = requests
        .into_iter()
        .map(|r| make_idv_request(state, r, uvw.user_vault.id.clone(), tenant_id.clone()));

    // Make requests!
    let result_statuses = futures::future::try_join_all(future_results).await?;
    // ***** TODO HERE ****
    // - Mark requirements as fulfilled
    // - Insert deciding final status (now it's same logic as before)
    // - Step ups
    // - Waterfalls
    risk::create_final_decision(state, ob_id, result_statuses).await?;

    Ok(())
}

async fn make_idv_request(
    state: &State,
    request: VerificationRequest,
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
) -> Result<Option<OnboardingStatus>, ApiError> {
    let request_id = request.id.clone();

    // TODO: could have different logic for different vendors?
    let data =
        verification_request::build_request::build_idv_data_from_verification_request(state, request.clone())
            .await?;

    // TODO: mark requirement statuses as fulfilled. I don't totally like it going in here but it's ok for now
    // TODO: handle collect doc - remove?
    let (idv_response, _) =
        verification_request::make_request::send_idv_request(state, request, data).await?;
    let status = idv_response.status;

    verification_result::save_verification_result(state, user_vault_id, tenant_id, request_id, idv_response)
        .await?;

    Ok(status)
}
