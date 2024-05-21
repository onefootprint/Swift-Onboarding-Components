DROP INDEX IF EXISTS audit_event_list_id;

-- The up part of this was originally in a former migration, but I had to manually fix it.
-- ALTER TABLE audit_event DROP CONSTRAINT fk_audit_event_list_id;
