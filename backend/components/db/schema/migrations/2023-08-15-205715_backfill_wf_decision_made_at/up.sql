UPDATE workflow
SET decision_made_at = onboarding.decision_made_at
FROM onboarding
WHERE workflow.id = onboarding.workflow_id AND workflow.decision_made_at IS NULL;

UPDATE workflow
SET decision_made_at = onboarding_decision.created_at
FROM onboarding_decision
WHERE
    workflow.id = onboarding_decision.workflow_id AND
    onboarding_decision.actor ->> 'kind' = 'footprint' AND
    workflow.decision_made_at IS NULL;