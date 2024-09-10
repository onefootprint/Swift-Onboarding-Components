ALTER TABLE scoped_vault_version
	ALTER tenant_id DROP NOT NULL;
ALTER TABLE scoped_vault_version
	ALTER is_live DROP NOT NULL;
