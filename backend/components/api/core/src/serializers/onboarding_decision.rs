use api_wire_types::Actor;
use db::{
    actor::SaturatedActor,
    models::{
        manual_review::ManualReview, ob_configuration::ObConfiguration,
        onboarding_decision::OnboardingDecision,
    },
};

use crate::utils::db2api::DbToApi;

impl DbToApi<(OnboardingDecision, SaturatedActor)> for api_wire_types::OnboardingDecision {
    fn from_db((decision, saturated_db_actor): (OnboardingDecision, SaturatedActor)) -> Self {
        Self::from_db((decision, None, saturated_db_actor, None))
    }
}

type OnboardingDecisionInfo = (
    OnboardingDecision,
    Option<ObConfiguration>,
    SaturatedActor,
    Option<ManualReview>,
);

impl DbToApi<OnboardingDecisionInfo> for api_wire_types::OnboardingDecision {
    fn from_db((decision, ob_configuration, saturated_db_actor, mr): OnboardingDecisionInfo) -> Self {
        let OnboardingDecision {
            id,
            status,
            created_at,
            ..
        } = decision;
        api_wire_types::OnboardingDecision {
            id,
            status,
            timestamp: created_at,
            source: Actor::from_db(saturated_db_actor),
            ob_configuration: ob_configuration.map(api_wire_types::LiteObConfiguration::from_db),
            manual_review: mr.map(api_wire_types::ManualReview::from_db),
        }
    }
}
