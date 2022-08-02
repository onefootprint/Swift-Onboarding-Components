CREATE TABLE tenant_api_key_access_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_api_key_id TEXT NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tenant_api_key_access_logs_tenant_api_key_id
        FOREIGN KEY(tenant_api_key_id) 
        REFERENCES tenant_api_keys(id)
);

CREATE INDEX IF NOT EXISTS tenant_api_key_access_logs_tenant_api_key_id ON tenant_api_key_access_logs(tenant_api_key_id, timestamp);

SELECT diesel_manage_updated_at('tenant_api_key_access_logs');