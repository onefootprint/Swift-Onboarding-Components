-- CREATE INDEX CONCURRENTLY user_timeline_for_backfill ON user_timeline(timestamp, id) WHERE seqno IS NULL;
-- CREATE INDEX CONCURRENTLY data_lifetime_for_backfill ON data_lifetime(created_at, created_seqno);

-- TODO(eforde) run in batches before merging
WITH user_timelines_to_update AS (
    SELECT id, timestamp
    FROM user_timeline
    WHERE seqno IS NULL
    ORDER BY timestamp DESC
    LIMIT 10000
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
-- SELECT * from seqnos_to_set ORDER BY seqno;
UPDATE user_timeline
-- If we couldn't find a seqno within a minute, put a non-null but obviously incorrect value.
-- e'll come back and fix these later with a bigger lookahead window - but will do small window first.
SET seqno = coalesce(s.seqno, -10)
FROM user_timelines_to_update ut
LEFT JOIN seqnos_to_set s ON s.id = ut.id
WHERE user_timeline.id = ut.id;