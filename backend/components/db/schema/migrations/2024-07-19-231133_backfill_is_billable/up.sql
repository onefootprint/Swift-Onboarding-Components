-- TODO run in batches before merging
-- CREATE INDEX CONCURRENTLY sv_migration ON scoped_vault(id) WHERE is_billable_for_vault_storage = 't'

SET statement_timeout = '5s';
WITH billable_sv_ids AS (
    SELECT distinct scoped_vault_id
    FROM data_lifetime
    WHERE deactivated_seqno IS NOT NULL
    AND kind NOT IN (
        'business.name',
        'id.first_name',
        'id.last_name',
        'id.email',
        'id.phone_number'
    )
),
sv_ids_to_update AS (
    SELECT id
    FROM scoped_vault
    WHERE
        -- Vault should not be billable
        id NOT IN (SELECT scoped_vault_id FROM billable_sv_ids)
        -- Needs to be updated
        AND is_billable_for_vault_storage = 't'
    -- LIMIT 1000
)
UPDATE scoped_vault
SET is_billable_for_vault_storage = 'f'
WHERE id IN (SELECT id FROM sv_ids_to_update);
