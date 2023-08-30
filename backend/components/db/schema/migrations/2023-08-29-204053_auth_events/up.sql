-- link to the webauthn credential by id instead of public key
ALTER TABLE apple_device_attestation
    ADD COLUMN bundle_id TEXT NOT NULL,
    DROP COLUMN webauthn_cred_public_key,
    ADD COLUMN webauthn_credential_id TEXT,
    ADD CONSTRAINT fk_apple_device_attestation_webauthn_credential_id
        FOREIGN KEY(webauthn_credential_id) 
        REFERENCES webauthn_credential(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS apple_device_attestation_webauthn_credential_id ON apple_device_attestation(webauthn_credential_id);
   
-- create our new auth event table
CREATE TABLE auth_event (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('auth_evt_'),
    vault_id TEXT NOT NULL,
    scoped_vault_id TEXT,
    insight_event_id TEXT,
    kind TEXT NOT NULL,
    webauthn_credential_id TEXT,

    created_at timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_auth_event_vault_id
        FOREIGN KEY(vault_id)
        REFERENCES vault(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_auth_event_scoped_vault_id
        FOREIGN KEY(scoped_vault_id)
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_auth_event_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_event(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_auth_event_webauthn_credential_id
        FOREIGN KEY(webauthn_credential_id)
        REFERENCES webauthn_credential(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS auth_event_vault_id ON auth_event(vault_id);
CREATE INDEX IF NOT EXISTS auth_event_scoped_vault_id ON auth_event(scoped_vault_id);
CREATE INDEX IF NOT EXISTS auth_event_insight_event_id ON auth_event(insight_event_id);
CREATE INDEX IF NOT EXISTS auth_event_webauthn_credential_id ON auth_event(webauthn_credential_id);

SELECT diesel_manage_updated_at('auth_event');