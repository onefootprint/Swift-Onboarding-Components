ALTER TABLE onboardings ADD COLUMN insight_event_id uuid;

CREATE INDEX IF NOT EXISTS onboardings_insight_event_id ON onboardings(insight_event_id);

UPDATE onboardings
    SET insight_event_id = onboarding_links.insight_event_id
    FROM onboarding_links
    WHERE onboarding_links.onboarding_id = onboardings.id;

ALTER TABLE onboardings
    ALTER COLUMN insight_event_id SET NOT NULL,
    ADD CONSTRAINT fk_onboardings_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id);