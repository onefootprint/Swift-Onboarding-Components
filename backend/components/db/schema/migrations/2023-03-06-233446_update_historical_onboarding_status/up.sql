
CREATE VIEW onboarding_backfill_status AS (
    SELECT 
        ob.id,
        CASE WHEN obd.status = 'pass' THEN 'pass'
            WHEN obd.status = 'fail' THEN 'fail'
            WHEN obd.status = 'step_up_required' THEN 'pending' -- shouldn't be any of these
            WHEN ob.authorized_at IS NOT NULL THEN 'pending'
            ELSE 'incomplete'
        END backfill_status
    FROM onboarding ob
    LEFT JOIN onboarding_decision obd ON (obd.onboarding_id = ob.id AND obd.deactivated_at IS NULL)
);

UPDATE onboarding ob
SET status = backfill.backfill_status
FROM onboarding_backfill_status backfill
WHERE ob.id = backfill.id AND ob.status = 'incomplete'; -- we don't to backfill status for onboardings that have already been written as {pass,fail,pending} through application code

DROP VIEW onboarding_backfill_status;
