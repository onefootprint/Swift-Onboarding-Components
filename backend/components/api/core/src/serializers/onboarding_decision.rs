use crate::utils::db2api::DbToApi;
use api_wire_types::Actor;
use db::actor::SaturatedActor;
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::OnboardingDecision;

impl DbToApi<(OnboardingDecision, SaturatedActor)> for api_wire_types::OnboardingDecision {
    fn from_db((decision, saturated_db_actor): (OnboardingDecision, SaturatedActor)) -> Self {
        Self::from_db((decision, None, saturated_db_actor, vec![]))
    }
}

type OnboardingDecisionInfo = (
    OnboardingDecision,
    Option<ObConfiguration>,
    SaturatedActor,
    Vec<ManualReview>,
);

impl DbToApi<OnboardingDecisionInfo> for api_wire_types::OnboardingDecision {
    fn from_db(
        (decision, ob_configuration, saturated_db_actor, cleared_mrs): OnboardingDecisionInfo,
    ) -> Self {
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
            ob_configuration: ob_configuration.map(api_wire_types::TimelinePlaybook::from_db),
            cleared_manual_reviews: cleared_mrs
                .into_iter()
                .map(api_wire_types::ManualReview::from_db)
                .collect(),
            rule_set_result_id: decision.rule_set_result_id,
        }
    }
}

impl DbToApi<ManualReview> for api_wire_types::ManualReview {
    fn from_db(mr: ManualReview) -> Self {
        let ManualReview { kind, .. } = mr;
        api_wire_types::ManualReview { kind }
    }
}
