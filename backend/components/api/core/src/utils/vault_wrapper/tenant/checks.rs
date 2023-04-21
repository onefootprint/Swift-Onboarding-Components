use crate::{
    auth::user::CheckedUserObAuthContext,
    errors::{onboarding::OnboardingError, ApiResult},
};

/// Some shared checks that are done before adding identity data to a user vault.
pub fn pre_add_data_checks(user_auth: &CheckedUserObAuthContext) -> ApiResult<()> {
    if let Ok(ob) = user_auth.onboarding() {
        if ob.idv_reqs_initiated_at.is_some() {
            // One day, we'll want to allow editing data after IDV reqs are initiated ONLY
            // when KYC checks don't pass and we want the user to update their info.
            // Until then, this introduces a race condition where we could commit data that
            // isn't verified, so for now we will disallow this.
            return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
        }
    }
    Ok(())
}
