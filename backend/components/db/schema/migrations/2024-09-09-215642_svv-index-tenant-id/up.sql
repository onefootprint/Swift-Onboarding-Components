CREATE INDEX CONCURRENTLY IF NOT EXISTS
	scoped_vault_version_tenant_id
	ON scoped_vault_version(tenant_id);
