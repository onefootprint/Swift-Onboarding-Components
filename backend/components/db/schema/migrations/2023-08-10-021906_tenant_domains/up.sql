
CREATE TABLE tenant_client_config (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('org_client_config_'),
    tenant_id TEXT NOT NULL,
    is_live BOOLEAN NOT NULL,
    deactivated_at timestamptz,
    allowed_origins TEXT[] NOT NULL,
    CONSTRAINT fk_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);
