CREATE INDEX CONCURRENTLY IF NOT EXISTS scoped_vault_external_id ON scoped_vault(external_id) WHERE external_id IS NOT NULL;
