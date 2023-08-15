ALTER TABLE middesk_request
    ADD COLUMN workflow_id TEXT,
    ADD CONSTRAINT fk_middesk_request_workflow_id
        FOREIGN KEY (workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS middesk_request_workflow_id ON middesk_request(workflow_id);
