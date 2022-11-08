
ALTER TABLE liveness_event ADD COLUMN insight_event_id UUID;
DELETE FROM liveness_event where insight_event_id IS NULL;
ALTER TABLE liveness_event ALTER COLUMN insight_event_id SET NOT NULL;

ALTER TABLE liveness_event ADD CONSTRAINT fk_liveness_event_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_event(id);

CREATE INDEX IF NOT EXISTS user_liveness_event_insight_event_id ON liveness_event(insight_event_id);