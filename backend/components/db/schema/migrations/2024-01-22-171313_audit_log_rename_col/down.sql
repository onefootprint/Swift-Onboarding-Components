ALTER TABLE audit_event RENAME COLUMN name to event_name;
DROP INDEX audit_event_name;
