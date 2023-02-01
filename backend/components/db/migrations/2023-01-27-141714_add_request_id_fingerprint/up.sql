TRUNCATE fingerprint_visit_event;

ALTER TABLE fingerprint_visit_event ADD COLUMN request_id TEXT NOT NULL;
CREATE INDEX IF NOT EXISTS fingerprint_visit_event_request_id ON fingerprint_visit_event(request_id);