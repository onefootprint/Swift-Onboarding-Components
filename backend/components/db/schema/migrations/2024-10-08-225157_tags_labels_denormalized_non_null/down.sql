ALTER TABLE scoped_vault_tag ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE scoped_vault_tag ALTER COLUMN is_live DROP NOT NULL; 

ALTER TABLE scoped_vault_label ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE scoped_vault_label ALTER COLUMN is_live DROP NOT NULL; 