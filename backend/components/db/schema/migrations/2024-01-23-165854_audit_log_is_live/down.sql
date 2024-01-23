ALTER TABLE audit_event DROP COLUMN is_live;
DROP INDEX IF EXISTS audit_event_is_live;
