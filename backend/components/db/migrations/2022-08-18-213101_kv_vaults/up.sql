CREATE TABLE kv_data (
    id text PRIMARY KEY DEFAULT prefixed_uid('data_'),
    user_vault_id text NOT NULL,
    tenant_id text NOT NULL,
    data_key text NOT NULL,
    e_data BYTEA NOT NULL,    
    deactivated_at timestamptz DEFAULT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_kv_data_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vault(id),
    CONSTRAINT fk_kv_data_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
);

CREATE INDEX IF NOT EXISTS kv_data_user_vault ON kv_data(user_vault_id);
CREATE INDEX IF NOT EXISTS kv_data_tenant ON kv_data(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS kv_data_key ON kv_data(data_key, user_vault_id, tenant_id) WHERE deactivated_at IS NULL;