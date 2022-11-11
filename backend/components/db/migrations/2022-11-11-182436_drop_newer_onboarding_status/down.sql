ALTER TABLE onboarding ADD COLUMN status TEXT;

UPDATE onboarding
SET status = CASE
    WHEN onboarding_decision.status = 'pass' THEN 'verified'
    WHEN onboarding_decision.status = 'fail' THEN 'failed'
    WHEN onboarding_decision.status = 'step_up_required' THEN 'step_up_required'
END
-- Update the status using the latest onboarding decision
FROM onboarding_decision
WHERE onboarding_decision.onboarding_id = onboarding.id AND onboarding_decision.deactivated_at IS NULL;

UPDATE onboarding SET status = 'processing' WHERE status IS NULL;

ALTER TABLE onboarding ALTER COLUMN status SET NOT NULL;