ALTER TABLE fingerprint_visit_event DROP COLUMN request_id;
DROP INDEX IF EXISTS fingerprint_visit_event_request_id;