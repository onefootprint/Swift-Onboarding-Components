ALTER TABLE scoped_vault_version
	ADD COLUMN tenant_id TEXT;
ALTER TABLE scoped_vault_version
	ADD COLUMN is_live BOOL;

ALTER TABLE scoped_vault_version
	ADD CONSTRAINT fk_scoped_vault_version_tenant_id
	FOREIGN KEY (tenant_id)
	REFERENCES tenant (id) NOT VALID;
