CREATE TABLE access_events (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    onboarding_id VARCHAR(250) NOT NULL,
    -- TODO who at the tenant accessed?
    -- TODO what was the exact data accessed? if there are multiple emails, might help to store data here
    -- TODO IP address/location?
    data_kind data_kind NOT NULL, 
    timestamp timestamp NOT NULL DEFAULT NOW(),
    created_at timestamp NOT NULL DEFAULT NOW(),
    updated_at timestamp NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_onboarding
        FOREIGN KEY(onboarding_id)
        REFERENCES onboardings(id)
);

SELECT diesel_manage_updated_at('access_events');
CREATE INDEX IF NOT EXISTS access_events_onboarding_id_data_kind ON access_events(onboarding_id, data_kind);