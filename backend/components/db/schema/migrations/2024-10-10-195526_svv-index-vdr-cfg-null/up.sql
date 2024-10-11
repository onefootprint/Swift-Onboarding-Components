CREATE INDEX CONCURRENTLY IF NOT EXISTS svv_tenant_id_is_live_vdr_cfg_id_null_seqno
	ON scoped_vault_version (tenant_id, is_live, seqno)
	WHERE backed_up_by_vdr_config_id IS NULL;
