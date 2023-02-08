WITH approved_ob_ids AS (
    SELECT onboarding_id
    FROM onboarding_decision
    WHERE onboarding_decision.deactivated_at IS NULL AND
        onboarding_decision.actor->>'kind' = 'footprint' AND
        onboarding_decision.status = 'pass'
), approved_su_ids AS (
    SELECT scoped_user_id 
    FROM onboarding
    WHERE id IN (SELECT onboarding_id FROM approved_ob_ids)
)
UPDATE user_timeline
SET is_portable = 't'
WHERE scoped_user_id IN (SELECT scoped_user_id FROM approved_su_ids) AND 
    event->>'kind' = 'data_collected';