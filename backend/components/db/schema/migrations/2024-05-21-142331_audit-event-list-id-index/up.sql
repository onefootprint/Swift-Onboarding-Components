-- Run these manually and mark the migration as done:
-- INSERT INTO __diesel_schema_migrations (version, run_on) VALUES ('20240521142331', NOW());

CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_event_list_id ON audit_event(list_id);

-- This part was originally in a former migration, but it should have been run after the index creation so it runs fast in prod.
--ALTER TABLE audit_event
--  ADD CONSTRAINT fk_audit_event_list_id
--  FOREIGN KEY (list_id)
--  REFERENCES list (id)
--  DEFERRABLE INITIALLY DEFERRED;
