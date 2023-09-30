ALTER TABLE scoped_vault ALTER COLUMN is_billable DROP DEFAULT;

-- I'm lazy - this could be two separate migrations.
-- Can't do in the same transaction because the former statement takes a lock, and the latter statement can run for a while
COMMIT;
BEGIN;

UPDATE scoped_vault set is_billable = 't'
FROM vault
WHERE scoped_vault.vault_id = vault.id AND vault.is_portable = 'f';

UPDATE scoped_vault set is_billable = 't'
FROM workflow
WHERE workflow.scoped_vault_id = scoped_vault.id AND workflow.authorized_at IS NOT NULL;