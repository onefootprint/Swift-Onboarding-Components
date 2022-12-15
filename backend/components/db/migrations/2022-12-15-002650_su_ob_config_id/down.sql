ALTER TABLE scoped_user DROP COLUMN ob_configuration_id;

CREATE UNIQUE INDEX scoped_users_unique_user_vault_id_tenant_id ON scoped_user(user_vault_id, tenant_id);