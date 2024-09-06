ALTER TABLE webauthn_credential ADD COLUMN scoped_vault_id TEXT;
-- TODO add index and foreign key constraint