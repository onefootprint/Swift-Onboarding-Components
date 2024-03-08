CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS unique_active_per_alias_tenant_id_is_live ON list(alias, tenant_id, is_live) WHERE deactivated_seqno IS NOT NULL;
