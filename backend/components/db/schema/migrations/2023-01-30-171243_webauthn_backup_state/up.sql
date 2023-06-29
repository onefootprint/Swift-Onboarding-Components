
ALTER TABLE webauthn_credential ADD COLUMN backup_state BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE webauthn_credential ALTER COLUMN backup_state DROP DEFAULT;