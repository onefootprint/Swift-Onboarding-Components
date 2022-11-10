CREATE TABLE audit_trail (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id text NOT NULL,
    tenant_id text,
    event jsonb NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    verification_result_id UUID,
    CONSTRAINT fk_audit_trails_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id),
    CONSTRAINT fk_audit_trails_tenant_id
        FOREIGN KEY(tenant_id)
        REFERENCES tenant(id),
    CONSTRAINT fk_audit_trails_verification_result_id
        FOREIGN KEY(verification_result_id)
        REFERENCES verification_result(id)
);

CREATE INDEX IF NOT EXISTS audit_trails_user_vault_id ON audit_trail(user_vault_id);
CREATE INDEX IF NOT EXISTS audit_trails_tenant_id ON audit_trail(tenant_id);
CREATE INDEX IF NOT EXISTS audit_trails_verification_result_id ON audit_trail(verification_result_id);

SELECT diesel_manage_updated_at('audit_trail');