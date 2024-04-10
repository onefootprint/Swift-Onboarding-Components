-- I've already run this in prod and dev. I'll run again before merging this PR so almost all values are non-null.
-- The goal is that the migration does very little work when it's deployed

WITH backfill_data AS (
  SELECT data_lifetime.id as lifetime_id, scoped_vault.id as scoped_vault_id, scoped_vault.vault_id, scoped_vault.tenant_id, scoped_vault.is_live, data_lifetime.deactivated_at
  FROM scoped_vault
  INNER JOIN data_lifetime
    ON scoped_vault.id = data_lifetime.scoped_vault_id
  WHERE data_lifetime.id IN (
    SELECT distinct lifetime_id FROM fingerprint
    -- Only rows that haven't yet been backfilled.
    -- Since we've already backfilled dev and prod, these should be very small quantities of users
    WHERE scoped_vault_id IS NULL
  )
)
UPDATE fingerprint
SET
  scoped_vault_id=backfill_data.scoped_vault_id,
  vault_id=backfill_data.vault_id,
  tenant_id=backfill_data.tenant_id,
  is_live=backfill_data.is_live,
  deactivated_at=backfill_data.deactivated_at
FROM backfill_data
WHERE fingerprint.lifetime_id = backfill_data.lifetime_id;