ALTER TABLE audit_event
ALTER COLUMN principal_actor SET NOT NULL,
ALTER COLUMN insight_event_id SET NOT NULL;