DROP INDEX onboardings_unique_user_vault_id_tenant_id;
ALTER TABLE onboardings ADD COLUMN ob_config_id text;

UPDATE onboardings
    SET ob_config_id = onboarding_links.ob_configuration_id
    FROM onboarding_links
    WHERE onboarding_links.onboarding_id = onboardings.id;

ALTER TABLE onboardings
    ALTER COLUMN ob_config_id SET NOT NULL,
    ADD CONSTRAINT fk_onboardings_ob_config_id
        FOREIGN KEY(ob_config_id) 
        REFERENCES ob_configurations(id);

CREATE INDEX IF NOT EXISTS onboardings_ob_config_id ON onboardings(ob_config_id);

DROP TABLE onboarding_links;