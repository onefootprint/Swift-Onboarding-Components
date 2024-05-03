-- I've made some modifications to this backfill after it's been run in dev and prod to better support folks' local environments
CREATE INDEX CONCURRENTLY user_timeline_for_backfill ON user_timeline(timestamp, id) WHERE seqno IS NULL;
CREATE INDEX CONCURRENTLY data_lifetime_for_backfill ON data_lifetime(created_at, created_seqno);

-- Lookahead of 1 min to backfill seqnos
WITH user_timelines_to_update AS (
    SELECT id, timestamp
    FROM user_timeline
    WHERE seqno IS NULL
    ORDER BY timestamp DESC
),
seqnos_to_set AS (
    -- Grab the DataLifetime that was created most recently after this timeline event and use its seqno - 1.
    -- This was the seqno at the time that the timeline event was created.
    SELECT DISTINCT ON(ut.id)
        ut.id,
        dl.created_seqno - 1 as seqno,
        ut.timestamp,
        dl.created_at
    FROM user_timelines_to_update ut
    INNER JOIN data_lifetime dl ON dl.created_at >= ut.timestamp AND dl.created_at < ut.timestamp + INTERVAL '1 minutes'
    ORDER BY ut.id, dl.created_at ASC
)
UPDATE user_timeline
SET seqno = s.seqno
FROM user_timelines_to_update ut
INNER JOIN seqnos_to_set s ON s.id = ut.id
WHERE user_timeline.id = ut.id;


-- Then do a slower lookahead of 1 day to backfill any stragglers
WITH user_timelines_to_update AS (
    SELECT id, timestamp
    FROM user_timeline
    WHERE seqno IS NULL
    ORDER BY timestamp DESC
),
seqnos_to_set AS (
    -- Grab the DataLifetime that was created most recently after this timeline event and use its seqno - 1.
    -- This was the seqno at the time that the timeline event was created.
    SELECT DISTINCT ON(ut.id)
        ut.id,
        dl.created_seqno - 1 as seqno,
        ut.timestamp,
        dl.created_at
    FROM user_timelines_to_update ut
    INNER JOIN data_lifetime dl ON dl.created_at >= ut.timestamp AND dl.created_at < ut.timestamp + INTERVAL '1 day'
    ORDER BY ut.id, dl.created_at ASC
)
UPDATE user_timeline
SET seqno = s.seqno
FROM user_timelines_to_update ut
INNER JOIN seqnos_to_set s ON s.id = ut.id
WHERE user_timeline.id = ut.id;

-- Catch all for local environments since it doesn't matter so much
UPDATE user_timeline SET seqno = 0 WHERE seqno IS NULL;


DROP INDEX CONCURRENTLY user_timeline_for_backfill;
DROP INDEX CONCURRENTLY data_lifetime_for_backfill;