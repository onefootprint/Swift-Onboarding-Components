ALTER TABLE audit_event RENAME COLUMN event_name to name;
CREATE INDEX IF NOT EXISTS audit_event_name ON audit_event(name);

