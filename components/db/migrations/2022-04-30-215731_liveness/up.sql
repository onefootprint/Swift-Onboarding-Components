CREATE TABLE webauthn_credentials (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_vault_id VARCHAR(250) NOT NULL,
    
    credential_id BYTEA NOT NULL,
    public_key BYTEA NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    attestation_data BYTEA NOT NULL,

    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),

    CONSTRAINT webauthn_credentials_user_id_fk
      FOREIGN KEY(user_vault_id) REFERENCES user_vaults(id)
);

CREATE INDEX IF NOT EXISTS webauthn_credential_user_vault_id ON webauthn_credentials(user_vault_id);
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_pubkey_user_vault_id ON webauthn_credentials(public_key);
CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_id_user_vault_id ON webauthn_credentials(credential_id);