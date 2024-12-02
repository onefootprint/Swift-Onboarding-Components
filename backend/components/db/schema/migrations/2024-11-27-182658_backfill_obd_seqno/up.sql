-- I've made some modifications to this backfill after it's been run in dev and prod to better support folks' local environments
-- These should be concurretly but this has already run in dev/prod
CREATE INDEX onboarding_decision_for_backfill ON onboarding_decision(created_at, id) WHERE seqno IS NULL;
CREATE INDEX data_lifetime_for_backfill ON data_lifetime(created_at, created_seqno);

-- Lookahead of 1 min to backfill seqnos
WITH onboarding_decisions_to_update AS (
    SELECT id, created_at
    FROM onboarding_decision
    WHERE seqno IS NULL
    ORDER BY created_at DESC
),
seqnos_to_set AS (
    -- Grab the DataLifetime that was created most recently after this timeline event and use its seqno - 1.
    -- This was the seqno at the time that the timeline event was created.
    SELECT DISTINCT ON(ut.id)
        ut.id,
        dl.created_seqno - 1 as seqno,
        ut.created_at,
        dl.created_at
    FROM onboarding_decisions_to_update ut
    INNER JOIN data_lifetime dl ON dl.created_at >= ut.created_at AND dl.created_at < ut.created_at + INTERVAL '1 minutes'
    ORDER BY ut.id, dl.created_at ASC
)
UPDATE onboarding_decision
SET seqno = s.seqno
FROM onboarding_decisions_to_update ut
INNER JOIN seqnos_to_set s ON s.id = ut.id
WHERE onboarding_decision.id = ut.id;


-- Then do a slower lookahead of 1 day to backfill any stragglers
WITH onboarding_decisions_to_update AS (
    SELECT id, created_at
    FROM onboarding_decision
    WHERE seqno IS NULL
    ORDER BY created_at DESC
),
seqnos_to_set AS (
    -- Grab the DataLifetime that was created most recently after this timeline event and use its seqno - 1.
    -- This was the seqno at the time that the timeline event was created.
    SELECT DISTINCT ON(ut.id)
        ut.id,
        dl.created_seqno - 1 as seqno,
        ut.created_at,
        dl.created_at
    FROM onboarding_decisions_to_update ut
    INNER JOIN data_lifetime dl ON dl.created_at >= ut.created_at AND dl.created_at < ut.created_at + INTERVAL '1 day'
    ORDER BY ut.id, dl.created_at ASC
)
UPDATE onboarding_decision
SET seqno = s.seqno
FROM onboarding_decisions_to_update ut
INNER JOIN seqnos_to_set s ON s.id = ut.id
WHERE onboarding_decision.id = ut.id;

-- Catch all for local environments since it doesn't matter so much
UPDATE onboarding_decision SET seqno = 0 WHERE seqno IS NULL;


-- These should be concurretly but this has already run in dev/prod
DROP INDEX onboarding_decision_for_backfill;
DROP INDEX data_lifetime_for_backfill;