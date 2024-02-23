-- It's actually more involved than this to revert this migration since the (tenant_id, external_id) unique constraint may be broken by new deactivated scoped vaults.
-- We'd probably have to hand-delete deactivated scoped vaults, and then recreate the old index using the commands below.

-- CREATE UNIQUE INDEX IF NOT EXISTS scoped_vault_unique_external_id_tenant_id ON scoped_vault(tenant_id, external_id);
-- DROP INDEX scoped_vault_active_unique_external_id_tenant_id;

-- Need a non-empty query to make the migration pass.
SELECT 1;
