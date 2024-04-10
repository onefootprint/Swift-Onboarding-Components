ALTER TABLE fingerprint
  DROP COLUMN scoped_vault_id,
  DROP COLUMN vault_id,
  DROP COLUMN tenant_id,
  DROP COLUMN is_live,
  DROP COLUMN deactivated_at;