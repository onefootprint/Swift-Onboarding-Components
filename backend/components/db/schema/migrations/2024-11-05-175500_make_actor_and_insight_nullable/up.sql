ALTER TABLE audit_event
ALTER COLUMN principal_actor DROP NOT NULL,
ALTER COLUMN insight_event_id DROP NOT NULL;