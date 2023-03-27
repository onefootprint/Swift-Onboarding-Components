use api_wire_types::Actor;
use db::{
    actor::SaturatedActor,
    models::{
        ob_configuration::ObConfiguration, onboarding_decision::OnboardingDecision,
        verification_request::VerificationRequest,
    },
};

use crate::utils::db2api::DbToApi;

impl DbToApi<(OnboardingDecision, SaturatedActor)> for api_wire_types::OnboardingDecision {
    fn from_db((decision, saturated_db_actor): (OnboardingDecision, SaturatedActor)) -> Self {
        Self::from_db((decision, None, None, saturated_db_actor))
    }
}

type OnboardingDecisionInfo = (
    OnboardingDecision,
    Option<ObConfiguration>,
    Option<Vec<VerificationRequest>>,
    SaturatedActor,
);

impl DbToApi<OnboardingDecisionInfo> for api_wire_types::OnboardingDecision {
    fn from_db((decision, ob_configuration, vrs, saturated_db_actor): OnboardingDecisionInfo) -> Self {
        let OnboardingDecision {
            id,
            status,
            created_at,
            ..
        } = decision;
        let vendors = vrs.map(|vrs| vrs.into_iter().map(|vr| vr.vendor).collect());
        api_wire_types::OnboardingDecision {
            id,
            status,
            timestamp: created_at,
            source: Actor::from_db(saturated_db_actor),
            ob_configuration: ob_configuration.map(api_wire_types::LiteObConfiguration::from_db),
            vendors,
        }
    }
}
