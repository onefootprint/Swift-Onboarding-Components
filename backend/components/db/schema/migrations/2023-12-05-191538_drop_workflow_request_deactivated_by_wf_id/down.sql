ALTER TABLE workflow_request ADD COLUMN deactivated_by_workflow_id TEXT;
ALTER TABLE workflow_request ADD CONSTRAINT fk_workflow_request_deactivated_by_workflow_id
        FOREIGN KEY(deactivated_by_workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS workflow_request_deactivated_by_workflow_id ON workflow_request(deactivated_by_workflow_id);

UPDATE workflow_request SET deactivated_by_workflow_id = workflow_id;