WITH svs_with_vreq_missing_di AS (
    SELECT
        scoped_vault_id, MIN(timestamp) timestamp
    FROM verification_request 
    WHERE 
        decision_intent_id is null
    GROUP BY 1
),
backfilled_decision_intents AS (
    INSERT INTO decision_intent(scoped_vault_id, created_at, kind)
    SELECT scoped_vault_id, timestamp, 'onboarding_kyc' FROM svs_with_vreq_missing_di
    RETURNING id, scoped_vault_id
)

UPDATE verification_request vreq
SET decision_intent_id = b.id
FROM backfilled_decision_intents b
WHERE 
    b.scoped_vault_id = vreq.scoped_vault_id
    AND vreq.decision_intent_id IS NULL;

COMMIT;
BEGIN;
ALTER TABLE verification_request ALTER COLUMN decision_intent_id SET NOT NULL;
