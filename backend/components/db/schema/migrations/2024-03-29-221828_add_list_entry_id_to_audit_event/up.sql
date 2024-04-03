ALTER TABLE audit_event 
    ADD COLUMN list_entry_id TEXT,
  ADD CONSTRAINT fk_audit_event_list_entry_id
      FOREIGN KEY(list_entry_id)
      REFERENCES list_entry(id)
      DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS audit_event_list_entry_id ON audit_event(list_entry_id);
