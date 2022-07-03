CREATE TABLE audit_trails (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id text NOT NULL,
    tenant_id text,
    event jsonb NOT NULL,
    timestamp timestamp NOT NULL,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_audit_trails_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vaults(id),
    CONSTRAINT fk_audit_trails_tenant_id
        FOREIGN KEY(tenant_id)
        REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS audit_trails_user_vault_id ON audit_trails(user_vault_id);
CREATE INDEX IF NOT EXISTS audit_trails_tenant_id ON audit_trails(tenant_id);

SELECT diesel_manage_updated_at('audit_trails');