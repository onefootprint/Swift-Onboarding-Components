use crate::{
    errors::{onboarding::OnboardingError, ApiError},
    utils::user_vault_wrapper::UserVaultWrapper,
    State,
};

use db::models::onboarding::Onboarding;
use newtypes::{KycStatus, TenantId, UserVaultId};

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
    // Check if the user is a sandbox user. Sandbox users have the final KYC state encoded in their
    // phone number's sandbox suffix
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &uvw_id))
        .await??;

    let decrypted_phone = if !uvw.user_vault.is_live {
        let phone_number = uvw.get_decrypted_primary_phone(state).await?;
        Some(phone_number)
    } else {
        None
    };

    let (requests, scoped_user, ob_id) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (ob, su) = Onboarding::lock_by_config(conn, &uvw.user_vault.id, &ob_config.id)?
                .ok_or(OnboardingError::NoOnboarding)?;
            // Can only start KYC checks for onboardings whose KYC checks have not yet been started
            if ob.kyc_status != KycStatus::New {
                return Err(OnboardingError::WrongKycState(ob.kyc_status).into());
            }
            let ob_id = ob.id.clone();
            let requests =
                verification_request::initiate_verification(conn, ob, &uvw, &tenant_id, decrypted_phone)?;
            Ok((requests, su, ob_id))
        })
        .await?;

    // Fire off all IDV requests. Now that the requests are saved in the DB, even if we crash here,
    // we know where to continue processing.
    if !requests.is_empty() {
        verification_request::initiate_idv_requests(
            state,
            ob_id,
            scoped_user.user_vault_id,
            scoped_user.tenant_id,
            requests,
        )
        .await?;
    }
    Ok(())
}
