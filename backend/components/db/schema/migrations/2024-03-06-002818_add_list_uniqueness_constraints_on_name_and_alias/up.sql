CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS unique_active_per_name_tenant_id_is_live ON list(name, tenant_id, is_live) WHERE deactivated_seqno IS NOT NULL;
