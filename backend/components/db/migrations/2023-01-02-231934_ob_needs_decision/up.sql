ALTER TABLE onboarding
   ADD COLUMN has_final_decision BOOL;

-- if we have a decision, we don't need to make one
CREATE VIEW obs_with_decisions AS (
    SELECT 
        DISTINCT ob.id as onboarding_id,
        obd.id IS NOT NULL as has_final_decision_derived
    from onboarding ob
    left join onboarding_decision obd on ob.id = obd.onboarding_id
);

UPDATE onboarding ob
SET 
   has_final_decision = obd.has_final_decision_derived
FROM obs_with_decisions obd
WHERE obd.onboarding_id = ob.id;


DROP VIEW obs_with_decisions;

ALTER TABLE onboarding
  ALTER COLUMN has_final_decision SET NOT NULL;