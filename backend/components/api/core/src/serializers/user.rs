use crate::utils::db2api::DbToApi;
use db::models::{
    onboarding::{BasicOnboardingInfo, Onboarding},
    scoped_vault::ScopedVault,
};

impl DbToApi<ScopedVault> for api_wire_types::UserId {
    fn from_db(target: ScopedVault) -> Self {
        let ScopedVault { fp_id, .. } = target;

        Self { id: fp_id }
    }
}

impl DbToApi<BasicOnboardingInfo<Onboarding>> for api_wire_types::User {
    fn from_db((ob, sv, manual_review, _): BasicOnboardingInfo<Onboarding>) -> Self {
        Self {
            id: sv.fp_id,
            status: ob.status,
            requires_manual_review: manual_review.is_some(),
        }
    }
}
