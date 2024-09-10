-- Split up creation of the NOT NULL constraints such that we don't hold a table lock for too long.

-- Run these manually on dev/prod.

-- Part 1: tenant_id
ALTER TABLE scoped_vault_version
	ADD CONSTRAINT scoped_vault_version_tenant_id_not_null
	CHECK (tenant_id IS NOT NULL) NOT VALID;

ALTER TABLE scoped_vault_version
	VALIDATE CONSTRAINT scoped_vault_version_tenant_id_not_null;

ALTER TABLE scoped_vault_version
	ALTER tenant_id SET NOT NULL;

ALTER TABLE scoped_vault_version
	DROP CONSTRAINT scoped_vault_version_tenant_id_not_null;


-- Part 2: is_live

ALTER TABLE scoped_vault_version
	ADD CONSTRAINT scoped_vault_version_is_live_not_null
	CHECK (is_live IS NOT NULL) NOT VALID;

ALTER TABLE scoped_vault_version
	VALIDATE CONSTRAINT scoped_vault_version_is_live_not_null;

ALTER TABLE scoped_vault_version
	ALTER is_live SET NOT NULL;

ALTER TABLE scoped_vault_version
	DROP CONSTRAINT scoped_vault_version_is_live_not_null;
