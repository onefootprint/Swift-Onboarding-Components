-- Note: will run this migration manually in pieces before this is deployed so we don't have a
-- long-running transaction in migrations locking lots of rows
WITH latest_activity AS (
    SELECT scoped_vault.id, MAX(workflow.completed_at) AS max_completed_at
    FROM scoped_vault
    LEFT JOIN workflow
        ON scoped_vault.id = scoped_vault_id
    GROUP BY 1
)
UPDATE scoped_vault
-- To emulate application logic, 
SET last_activity_at = GREATEST(start_timestamp, latest_activity.max_completed_at)
FROM latest_activity
WHERE
    last_activity_at IS NULL AND
    scoped_vault.id = latest_activity.id;


ALTER TABLE scoped_vault ALTER COLUMN last_activity_at SET NOT NULL;

-- TODO index