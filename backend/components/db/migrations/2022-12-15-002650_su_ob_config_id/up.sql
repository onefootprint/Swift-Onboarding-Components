ALTER TABLE scoped_user
    ADD COLUMN ob_configuration_id TEXT,
    ADD CONSTRAINT fk_scoped_user_ob_configuration_id
        FOREIGN KEY(ob_configuration_id) 
        REFERENCES ob_configuration(id)
        DEFERRABLE INITIALLY DEFERRED;

UPDATE scoped_user
    SET ob_configuration_id = onboarding.ob_configuration_id
    FROM onboarding
    WHERE onboarding.scoped_user_id = scoped_user.id;

CREATE INDEX scoped_user_ob_configuration_id ON scoped_user(ob_configuration_id);

-- Drop old uniqueness index
DROP INDEX scoped_users_unique_user_vault_id_tenant_id;

-- We need two different indexes to enforce uniqueness property since in postgres NULL != NULL.
-- First, enforce that there's only one scoped user for each (user, ob_config) pair.
CREATE UNIQUE INDEX scoped_users_unique_user_vault_id_ob_config_id ON scoped_user(user_vault_id, ob_configuration_id);
-- Then, where ob_config is NULL, enforce there's only one scoped user for each (user, tenant).
CREATE UNIQUE INDEX scoped_users_unique_user_vault_id_tenant_id_no_ob_config ON scoped_user(user_vault_id, tenant_id) WHERE ob_configuration_id IS NULL;