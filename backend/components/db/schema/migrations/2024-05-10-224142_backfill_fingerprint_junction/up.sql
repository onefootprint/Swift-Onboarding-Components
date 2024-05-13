-- TODO run before merging
WITH rows_to_insert AS (
    SELECT fingerprint.id as fingerprint_id, fingerprint.lifetime_id
    FROM fingerprint
    -- Don't make duplicate junction rows
    LEFT JOIN fingerprint_junction ON fingerprint_id = fingerprint.id
    WHERE fingerprint_junction.id IS NULL
    LIMIT 5000
)
INSERT INTO fingerprint_junction (fingerprint_id, lifetime_id)
(
    SELECT fingerprint_id, lifetime_id
    FROM rows_to_insert
);