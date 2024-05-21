ALTER TABLE audit_event
  ADD COLUMN IF NOT EXISTS list_id TEXT;

-- This is fast enough to run without the index in dev/local, but not in prod.
-- I had to manually fix by creating the index first.
ALTER TABLE audit_event
  ADD CONSTRAINT fk_audit_event_list_id
  FOREIGN KEY (list_id)
  REFERENCES list (id)
  DEFERRABLE INITIALLY DEFERRED;
