ALTER TABLE onboarding
    ADD COLUMN authorized_at TIMESTAMPTZ,
    ADD COLUMN idv_reqs_initiated_at TIMESTAMPTZ,
    ADD COLUMN decision_made_at TIMESTAMPTZ;

-- Backfill authorized_at with the _updated_at of the onboarding... oof
UPDATE onboarding SET authorized_at = _updated_at WHERE is_authorized = 't';

-- Backfill decision_made_at with the time the automated footprint decision was made for the onboarding
UPDATE onboarding
SET decision_made_at = onboarding_decision.created_at
FROM onboarding_decision
WHERE onboarding.has_final_decision = 't' AND
    onboarding_decision.onboarding_id = onboarding.id AND
    onboarding_decision.actor->>'kind' = 'footprint';

-- Backfill idv_reqs_initiated_at with the time the VerificationRequests were created
UPDATE onboarding
SET idv_reqs_initiated_at = vr1.timestamp
-- Get all VRs for the onboarding and choose the one with the earliest timestamp
FROM verification_request vr1
    LEFT JOIN verification_request vr2 ON vr1.onboarding_id = vr2.onboarding_id AND vr1.timestamp > vr2.timestamp
WHERE onboarding.idv_reqs_initiated = 't' AND
    vr1.onboarding_id = onboarding.id AND
    vr2.id IS NULL; -- No vr2 with an earlier timestamp