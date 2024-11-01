-- TODO run before merging
ALTER TABLE workflow_request_junction
ADD CONSTRAINT fk_workflow_request_junction_workflow_id
    FOREIGN KEY(workflow_id)
    REFERENCES workflow(id)
    DEFERRABLE INITIALLY DEFERRED;
