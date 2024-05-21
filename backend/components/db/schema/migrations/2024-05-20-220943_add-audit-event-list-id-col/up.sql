ALTER TABLE audit_event
  ADD COLUMN IF NOT EXISTS list_id TEXT;

ALTER TABLE audit_event
  ADD CONSTRAINT fk_audit_event_list_id
  FOREIGN KEY (list_id)
  REFERENCES list (id)
  DEFERRABLE INITIALLY DEFERRED;
