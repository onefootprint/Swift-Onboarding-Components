CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_event_tenant_id_sandbox_or_global_timestamp_name ON audit_event(tenant_id, (is_live = false or is_live is null), timestamp, name);
