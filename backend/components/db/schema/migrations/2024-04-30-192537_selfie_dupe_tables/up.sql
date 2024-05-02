CREATE TABLE incode_customer_session (
    id text PRIMARY KEY DEFAULT prefixed_uid('ics_'),
    created_at timestamptz NOT NULL,
    scoped_vault_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    incode_verification_session_id TEXT NOT NULL,
    incode_customer_id TEXT NOT NULL,

    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_incode_customer_session_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_incode_customer_session_incode_verification_session_id
        FOREIGN KEY(incode_verification_session_id) 
        REFERENCES incode_verification_session(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_incode_customer_session_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);
SELECT diesel_manage_updated_at('incode_customer_session');
CREATE INDEX IF NOT EXISTS incode_customer_id_scoped_vault_id ON incode_customer_session(scoped_vault_id);
CREATE INDEX IF NOT EXISTS incode_customer_id_tenant_id ON incode_customer_session(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS incode_customer_id_scoped_vault_id_incode_verification_session_id ON incode_customer_session(scoped_vault_id, incode_verification_session_id);
CREATE INDEX IF NOT EXISTS incode_customer_id_customer_id ON incode_customer_session(incode_customer_id);
