CREATE TABLE tenant_vendor_control (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('org_vend_'),
    tenant_id TEXT NOT NULL,
    deactivated_at timestamptz,
    
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    
    idology_enabled BOOL NOT NULL DEFAULT False,
    idology_username TEXT,
    idology_e_password bytea,

    experian_enabled BOOL NOT NULL DEFAULT False,
    experian_subscriber_code TEXT,

    CONSTRAINT fk_tenant
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('tenant_vendor_control');
CREATE INDEX IF NOT EXISTS tenant_vendor_control_tenant_id ON tenant_vendor_control(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS tenant_vendor_control_tenant_deactivated_unique ON tenant_vendor_control(tenant_id) WHERE deactivated_at IS NULL;
