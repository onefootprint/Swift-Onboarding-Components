CREATE INDEX CONCURRENTLY IF NOT EXISTS
	scoped_vault_version_tenant_id_is_live_seqno
	ON scoped_vault_version(tenant_id, is_live, seqno);
