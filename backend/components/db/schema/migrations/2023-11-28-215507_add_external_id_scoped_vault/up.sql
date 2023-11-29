ALTER TABLE scoped_vault ADD COLUMN external_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS scoped_vault_unique_external_id_tenant_id ON scoped_vault(tenant_id, external_id);
