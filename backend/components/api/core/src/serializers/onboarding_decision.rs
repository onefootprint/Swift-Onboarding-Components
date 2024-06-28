use crate::utils::db2api::DbToApi;
use api_wire_types::Actor;
use db::models::manual_review::ManualReview;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::onboarding_decision::SaturatedOnboardingDecisionInfo;
use newtypes::WorkflowFixtureResult;

impl DbToApi<SaturatedOnboardingDecisionInfo> for api_wire_types::OnboardingDecision {
    fn from_db(
        (decision, wf, obc, saturated_db_actor, cleared_mrs): SaturatedOnboardingDecisionInfo,
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
            ob_configuration: api_wire_types::TimelinePlaybook::from_db(obc),
            cleared_manual_reviews: cleared_mrs
                .into_iter()
                .map(api_wire_types::ManualReview::from_db)
                .collect(),
            rule_set_result_id: decision.rule_set_result_id,
            ran_rules_in_sandbox: wf.fixture_result == Some(WorkflowFixtureResult::UseRulesOutcome),
        }
    }
}

impl DbToApi<ManualReview> for api_wire_types::ManualReview {
    fn from_db(mr: ManualReview) -> Self {
        let ManualReview { kind, .. } = mr;
        api_wire_types::ManualReview { kind }
    }
}
