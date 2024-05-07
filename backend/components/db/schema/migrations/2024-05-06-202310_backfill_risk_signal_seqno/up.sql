-- CREATE INDEX CONCURRENTLY risk_signal_backfill ON risk_signal(id) WHERE seqno is null;

-- TODO: run this manually before merging
WITH rs_to_update AS (
    SELECT rs.id, vreq.uvw_snapshot_seqno as seqno
    FROM risk_signal rs
    INNER JOIN verification_result vres ON verification_result_id = vres.id
    INNER JOIN verification_request vreq ON request_id = vreq.id
    WHERE rs.seqno IS NULL
    ORDER BY rs.id ASC
)
UPDATE risk_signal
SET seqno = rs_to_update.seqno
FROM rs_to_update
WHERE risk_signal.id = rs_to_update.id;

-- DROP INDEX CONCURRENTLY risk_signal_backfill;
