-- Add new columns to onboarding_links and backfill
ALTER TABLE onboarding_links
    ADD COLUMN status text,
    ADD COLUMN insight_event_id uuid,
    ADD CONSTRAINT fk_onboarding_links_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_events(id);

ALTER TABLE onboarding_links RENAME COLUMN timestamp TO start_timestamp;

UPDATE onboarding_links
    SET status=onboardings.status, insight_event_id=onboardings.insight_event_id
    FROM onboardings
    WHERE onboardings.id = onboarding_links.onboarding_id;

ALTER TABLE onboarding_links
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN insight_event_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS onboarding_links_insight_event_id ON onboarding_links(insight_event_id);

-- Drop the old columns on onboarding
ALTER TABLE onboardings DROP COLUMN status, DROP COLUMN insight_event_id;