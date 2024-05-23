CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_event_tenant_id_is_live_timestamp_name ON audit_event(tenant_id, is_live, timestamp, name);
