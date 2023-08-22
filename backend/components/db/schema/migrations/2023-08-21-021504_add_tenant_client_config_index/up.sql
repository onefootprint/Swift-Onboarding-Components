CREATE UNIQUE INDEX IF NOT EXISTS tenant_client_config_tenant_id ON tenant_client_config(tenant_id, is_live) WHERE deactivated_at IS NULL;
