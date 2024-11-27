use crate::utils::db2api::DbToApi;
use api_wire_types::Actor;
use api_wire_types::OnboardingDecisionKind;
use db::models::manual_review::ManualReview;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::onboarding_decision::SaturatedOnboardingDecisionInfo;
use db::models::playbook::Playbook;
use db::models::workflow::Workflow;
use newtypes::DbActor;
use newtypes::WorkflowFixtureResult;

impl DbToApi<SaturatedOnboardingDecisionInfo> for api_wire_types::TimelineOnboardingDecision {
    fn from_db(
        (decision, wf, _, obc, saturated_db_actor, cleared_mrs): SaturatedOnboardingDecisionInfo,
    ) -> Self {
        let OnboardingDecision {
            id,
            status,
            created_at,
            ..
        } = decision;
        let Workflow {
            fixture_result,
            kind: workflow_kind,
            ..
        } = wf;
        api_wire_types::TimelineOnboardingDecision {
            id,
            status,
            timestamp: created_at,
            source: Actor::from_db(saturated_db_actor),
            workflow_kind,
            ob_configuration: api_wire_types::TimelinePlaybook::from_db(obc),
            cleared_manual_reviews: cleared_mrs
                .into_iter()
                .map(api_wire_types::ManualReview::from_db)
                .collect(),
            rule_set_result_id: decision.rule_set_result_id,
            ran_rules_in_sandbox: fixture_result == Some(WorkflowFixtureResult::UseRulesOutcome),
        }
    }
}

impl DbToApi<ManualReview> for api_wire_types::ManualReview {
    fn from_db(mr: ManualReview) -> Self {
        let ManualReview { kind, .. } = mr;
        api_wire_types::ManualReview { kind }
    }
}

impl DbToApi<(OnboardingDecision, Playbook)> for api_wire_types::PublicOnboardingDecision {
    fn from_db((decision, playbook): (OnboardingDecision, Playbook)) -> Self {
        let OnboardingDecision {
            status,
            created_at,
            actor,
            ..
        } = decision;
        // The actor who made the decision determines whether this is an automated decision or manual
        // decision
        let (kind, playbook_key) = match actor {
            DbActor::Footprint => (OnboardingDecisionKind::PlaybookRun, Some(playbook.key)),
            DbActor::TenantApiKey { .. } | DbActor::TenantUser { .. } | DbActor::FirmEmployee { .. } => {
                (OnboardingDecisionKind::Manual, None)
            }
            DbActor::User { .. } => {
                tracing::error!("Got OnboardingDecision with User actor");
                (OnboardingDecisionKind::Manual, None)
            }
        };
        api_wire_types::PublicOnboardingDecision {
            status,
            timestamp: created_at,
            kind,
            playbook_key,
        }
    }
}
