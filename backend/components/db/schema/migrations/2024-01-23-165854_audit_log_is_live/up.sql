ALTER TABLE audit_event ADD COLUMN is_live boolean;
CREATE INDEX IF NOT EXISTS audit_event_is_live ON audit_event(is_live);
