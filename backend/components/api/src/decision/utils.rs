use newtypes::OnboardingStatus;

use crate::{errors::ApiError, utils::user_vault_wrapper::UserVaultWrapper, State};

// Logic to figure out test status from some of the identity data we collected during onboarding
// As of 2022-10-15 we do this by looking at the phone number
pub(super) async fn get_desired_status_for_testing(
    state: &State,
    uvw: &UserVaultWrapper,
) -> Result<OnboardingStatus, ApiError> {
    let decrypted_phone = if !uvw.user_vault.is_live {
        let phone_number = uvw.get_decrypted_primary_phone(state).await?;
        Some(phone_number)
    } else {
        None
    };
    let desired_status = if let Some(decrypted_phone) = decrypted_phone {
        // This is a sandbox user vault. Check for pre-set validation cases
        if decrypted_phone.suffix.starts_with("fail") {
            OnboardingStatus::Failed
        } else if decrypted_phone.suffix.starts_with("manualreview") {
            OnboardingStatus::ManualReview
        } else if decrypted_phone.suffix.starts_with("idv") {
            OnboardingStatus::Processing
        } else {
            OnboardingStatus::Verified
        }
    } else {
        // TODO kick off user verification with data vendors
        OnboardingStatus::Verified
    };

    Ok(desired_status)
}
