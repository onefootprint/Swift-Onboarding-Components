ALTER TABLE webauthn_credentials ALTER COLUMN insight_event_id SET NOT NULL;

-- This column is redundant since we can just look up the insight event on the webauthn cred
ALTER TABLE onboardings DROP CONSTRAINT fk_liveness_insight_event;
ALTER TABLE onboardings DROP COLUMN liveness_insight_event_id;

-- Now that there's only one insight event column on onboarding, can rename it
ALTER TABLE onboardings DROP CONSTRAINT fk_start_insight_event;
ALTER TABLE onboardings RENAME COLUMN start_insight_event_id TO insight_event_id;
ALTER TABLE onboardings ADD CONSTRAINT fk_insight_event
    FOREIGN KEY(insight_event_id)
    REFERENCES insight_events(id);