CREATE TABLE onboardings (
    id VARCHAR(250) PRIMARY KEY DEFAULT prefixed_uid('ob_'),
    user_ob_id VARCHAR(250) UNIQUE NOT NULL DEFAULT prefixed_uid('fp_id_'),
    user_vault_id VARCHAR(250) NOT NULL,
    ob_config_id VARCHAR(250) NOT NULL,
    tenant_id VARCHAR(250) NOT NULL,
    status text NOT NULL,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),
    insight_event_id uuid NOT NULL,
    ordering_id BIGSERIAL NOT NULL,
    start_timestamp timestamp NOT NULL,
    CONSTRAINT fk_onboardings_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenants(id),
    CONSTRAINT fk_onboardings_ob_config_id
        FOREIGN KEY(ob_config_id) 
        REFERENCES ob_configurations(id),
    CONSTRAINT fk_onboardings_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vaults(id),
    CONSTRAINT fk_onboardings_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id)
);

-- Don't allow users to onboard to the same configuration multiple times
CREATE UNIQUE INDEX IF NOT EXISTS user_unique_onboarding_configs ON onboardings(user_vault_id, ob_config_id);

CREATE INDEX IF NOT EXISTS onboardings_fp_id ON onboardings(user_ob_id);
CREATE INDEX IF NOT EXISTS onboardings_tenant_id ON onboardings(tenant_id);
CREATE INDEX IF NOT EXISTS onboardings_ob_config_id ON onboardings(ob_config_id);
CREATE INDEX IF NOT EXISTS onboardings_user_vault_id ON onboardings(user_vault_id);
CREATE INDEX IF NOT EXISTS onboardings_insight_event_id ON onboardings(insight_event_id);

SELECT diesel_manage_updated_at('onboardings');