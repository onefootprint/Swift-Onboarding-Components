CREATE INDEX CONCURRENTLY IF NOT EXISTS scoped_vault_query ON scoped_vault(tenant_id, is_live, kind, last_activity_at) WHERE show_in_search = 't' AND deactivated_at IS NULL;