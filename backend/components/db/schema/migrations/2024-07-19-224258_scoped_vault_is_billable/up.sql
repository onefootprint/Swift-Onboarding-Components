-- TODO drop default
ALTER TABLE scoped_vault ADD COLUMN is_billable_for_vault_storage BOOLEAN NOT NULL DEFAULT 't';