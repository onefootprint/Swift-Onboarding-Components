-- Re-add the columns to the onboardings table and backfill
ALTER TABLE onboardings
    ADD COLUMN status text,
    ADD COLUMN insight_event_id uuid,
    ADD CONSTRAINT fk_onboardings_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id);

UPDATE onboardings
    SET status=onboarding_links.status, insight_event_id=onboarding_links.insight_event_id
    FROM onboarding_links
    WHERE onboardings.id = onboarding_links.onboarding_id;

ALTER TABLE onboardings
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN insight_event_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS onboardings_insight_event_id ON onboardings(insight_event_id);

-- Drop the new columns on onboarding_links
ALTER TABLE onboarding_links
    DROP COLUMN status,
    DROP COLUMN insight_event_id;

ALTER TABLE onboarding_links RENAME COLUMN start_timestamp TO timestamp;