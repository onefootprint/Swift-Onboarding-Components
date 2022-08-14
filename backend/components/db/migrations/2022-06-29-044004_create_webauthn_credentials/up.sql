CREATE TABLE webauthn_credentials (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id text NOT NULL,
    
    credential_id BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    attestation_data BYTEA NOT NULL,

    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),

    backup_eligible boolean not null default False,
    attestation_type text not null DEFAULT 'Unknown',
    insight_event_id uuid NOT NULL,

    CONSTRAINT fk_webauthn_credentials_user_vault_id
      FOREIGN KEY(user_vault_id)
      REFERENCES user_vaults(id),
    CONSTRAINT fk_webauthn_credentials_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id)
);

CREATE INDEX IF NOT EXISTS webauthn_credentials_user_vault_id ON webauthn_credentials(user_vault_id);
CREATE INDEX IF NOT EXISTS webauthn_credentials_insight_event_id ON webauthn_credentials(insight_event_id);
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_pubkey_user_vault_id ON webauthn_credentials(public_key);
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_id_user_vault_id ON webauthn_credentials(credential_id);

SELECT diesel_manage_updated_at('webauthn_credentials');