ALTER TABLE socure_device_session
    ADD COLUMN workflow_id TEXT,
    ADD CONSTRAINT fk_socure_device_session_workflow_id
        FOREIGN KEY (workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS socure_device_session_workflow_id ON socure_device_session(workflow_id);