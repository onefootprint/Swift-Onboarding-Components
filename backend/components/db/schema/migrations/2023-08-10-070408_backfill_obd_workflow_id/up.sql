SET CONSTRAINTS ALL IMMEDIATE;

UPDATE onboarding_decision
SET workflow_id = onboarding.workflow_id
FROM onboarding
WHERE onboarding_decision.onboarding_id = onboarding.id;

ALTER TABLE onboarding_decision
    ALTER COLUMN workflow_id SET NOT NULL;