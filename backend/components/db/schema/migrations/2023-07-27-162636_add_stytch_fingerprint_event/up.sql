CREATE TABLE stytch_fingerprint_event (
    id text PRIMARY KEY DEFAULT prefixed_uid('sfe_'),
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    session_id TEXT,
    vault_id TEXT,
    scoped_vault_id TEXT,
    verification_result_id TEXT NOT NULL,
    
    browser_fingerprint TEXT,
    browser_id TEXT,
    hardware_fingerprint TEXT,
    network_fingerprint TEXT,
    visitor_fingerprint TEXT,
    visitor_id TEXT,

    CONSTRAINT fk_stytch_fingerprint_event_vault_id
       FOREIGN KEY(vault_id) 
       REFERENCES vault(id)
       DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_stytch_fingerprint_event_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_stytch_fingerprint_event_verification_result_id
        FOREIGN KEY(verification_result_id) 
        REFERENCES verification_result(id)
        DEFERRABLE INITIALLY DEFERRED


);
CREATE INDEX IF NOT EXISTS stytch_fingerprint_event_vault_id ON stytch_fingerprint_event(vault_id);
CREATE INDEX IF NOT EXISTS stytch_fingerprint_event_scoped_vault_id ON stytch_fingerprint_event(scoped_vault_id);
CREATE INDEX IF NOT EXISTS stytch_fingerprint_event_verification_result_id ON stytch_fingerprint_event(verification_result_id);
SELECT diesel_manage_updated_at('stytch_fingerprint_event');
