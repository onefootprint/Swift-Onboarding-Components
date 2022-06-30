CREATE TABLE access_events (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    onboarding_id VARCHAR(250) NOT NULL,
    -- TODO who at the tenant accessed?
    -- TODO what was the exact data accessed? if there are multiple emails, might help to store data here
    -- TODO IP address/location?
    timestamp timestamp NOT NULL DEFAULT NOW(),
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),
    insight_event_id uuid NOT NULL,
    reason VARCHAR(250) NOT NULL,
    principal VARCHAR(250),
    data_kinds text[] NOT NULL,
    ordering_id BIGSERIAL NOT NULL,

    CONSTRAINT fk_access_events_onboarding_id
        FOREIGN KEY(onboarding_id)
        REFERENCES onboardings(id),
    CONSTRAINT fk_access_events_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id)
);

CREATE INDEX IF NOT EXISTS access_events_onboarding_id_data_kind ON access_events(onboarding_id, data_kinds);
CREATE INDEX IF NOT EXISTS access_events_insight_event_id ON access_events(insight_event_id);

SELECT diesel_manage_updated_at('access_events');
