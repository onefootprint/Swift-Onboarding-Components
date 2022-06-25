ALTER TABLE webauthn_credentials ALTER COLUMN insight_event_id DROP NOT NULL;

ALTER TABLE onboardings ADD COLUMN liveness_insight_event_id uuid;
ALTER TABLE onboardings ADD CONSTRAINT fk_liveness_insight_event
    FOREIGN KEY(liveness_insight_event_id)
    REFERENCES insight_events(id);

ALTER TABLE onboardings DROP CONSTRAINT fk_insight_event;
ALTER TABLE onboardings RENAME COLUMN insight_event_id TO start_insight_event_id;
ALTER TABLE onboardings ADD CONSTRAINT fk_start_insight_event
    FOREIGN KEY(start_insight_event_id)
    REFERENCES insight_events(id);