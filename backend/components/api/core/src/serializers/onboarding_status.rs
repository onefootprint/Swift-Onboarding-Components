use crate::utils::db2api::DbToApi;
use api_wire_types::hosted::onboarding_status::ApiOnboardingRequirement;
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use newtypes::OrderedOnboardingRequirements;

impl
    DbToApi<(
        OrderedOnboardingRequirements,
        api_wire_types::PublicOnboardingConfiguration,
    )> for OnboardingStatusResponse
{
    fn from_db(
        (reqs, ob_configuration): (
            OrderedOnboardingRequirements,
            api_wire_types::PublicOnboardingConfiguration,
        ),
    ) -> Self {
        let all_requirements = reqs
            .into_iter()
            .map(|r| ApiOnboardingRequirement {
                is_met: r.is_met(),
                requirement: r,
            })
            .collect();
        Self {
            all_requirements,
            ob_configuration,
        }
    }
}
