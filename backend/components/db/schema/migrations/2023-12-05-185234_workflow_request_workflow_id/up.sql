-- This table only has 200 rows, so the normal rule to backfill and create indexes
-- outside of the transaction don't apply here

ALTER TABLE workflow_request ADD COLUMN workflow_id TEXT;
ALTER TABLE workflow_request ADD CONSTRAINT fk_workflow_request_workflow_id
        FOREIGN KEY(workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS workflow_request_workflow_id ON workflow_request(workflow_id);

UPDATE workflow_request SET workflow_id = deactivated_by_workflow_id;