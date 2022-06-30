CREATE TABLE tenant_api_keys (
    id text PRIMARY KEY DEFAULT prefixed_uid('key_id_'),
    sh_secret_api_key BYTEA NOT NULL,
    e_secret_api_key BYTEA NOT NULL,
    tenant_id text NOT NULL,
    key_name VARCHAR(250) NOT NULL,
    is_enabled BOOLEAN NOT NULL,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tenant_api_keys_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS tenant_api_keys_tenant_id ON tenant_api_keys(tenant_id);

SELECT diesel_manage_updated_at('tenant_api_keys');