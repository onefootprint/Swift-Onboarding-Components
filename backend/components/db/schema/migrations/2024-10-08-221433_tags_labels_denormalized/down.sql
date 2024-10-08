ALTER TABLE scoped_vault_tag DROP COLUMN tenant_id;
ALTER TABLE scoped_vault_tag DROP COLUMN is_live;

ALTER TABLE scoped_vault_label DROP COLUMN tenant_id;
ALTER TABLE scoped_vault_label DROP COLUMN is_live;