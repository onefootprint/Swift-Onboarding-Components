-- Junction table to attach multiple ob_configuration rows to one onboarding
CREATE TABLE onboarding_links (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    onboarding_id text NOT NULL,
    ob_configuration_id text NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_onboarding_links_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboardings(id),
    CONSTRAINT fk_onboarding_links_ob_configuration_id
        FOREIGN KEY(ob_configuration_id) 
        REFERENCES ob_configurations(id)
);
 
CREATE INDEX IF NOT EXISTS fk_onboarding_links_onboarding_id ON onboarding_links(onboarding_id);
CREATE INDEX IF NOT EXISTS fk_onboarding_links_ob_configuration_id ON onboarding_links(ob_configuration_id);
CREATE UNIQUE INDEX IF NOT EXISTS onboarding_links_onboarding_id_ob_configuration_id ON onboarding_links(onboarding_id, ob_configuration_id);

INSERT INTO onboarding_links (onboarding_id, ob_configuration_id, timestamp)
    SELECT id, ob_config_id, start_timestamp FROM onboardings;

ALTER TABLE onboardings DROP COLUMN ob_config_id;
-- Now, onboardings are unique per (tenant, user) tuple
CREATE UNIQUE INDEX IF NOT EXISTS onboardings_unique_user_vault_id_tenant_id ON onboardings(user_vault_id, tenant_id);