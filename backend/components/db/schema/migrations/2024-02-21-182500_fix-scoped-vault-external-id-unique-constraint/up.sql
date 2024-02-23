CREATE UNIQUE INDEX IF NOT EXISTS scoped_vault_active_unique_external_id_tenant_id ON scoped_vault(tenant_id, external_id) WHERE deactivated_at IS NULL;
DROP INDEX IF EXISTS scoped_vault_unique_external_id_tenant_id;
