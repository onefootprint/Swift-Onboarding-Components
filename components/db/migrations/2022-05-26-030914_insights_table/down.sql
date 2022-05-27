ALTER TABLE access_events
DROP COLUMN insight_event_id;

ALTER TABLE onboardings
DROP COLUMN start_insight_event_id,
DROP COLUMN liveness_insight_event_id;

DROP TABLE insight_events;