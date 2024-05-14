-- Since we set the default value to 'person', we only have to backfill sv.kind for the business vaults
-- TODO run in prod before merging
UPDATE scoped_vault
SET kind = 'business'
FROM vault
WHERE scoped_vault.vault_id = vault.id AND vault.kind = 'business';