CREATE UNIQUE INDEX IF NOT EXISTS webauthn_credential_pubkey_scoped_vault_id ON webauthn_credential(public_key, scoped_vault_id);