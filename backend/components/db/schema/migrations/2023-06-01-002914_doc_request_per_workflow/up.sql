ALTER TABLE document_request
    ADD COLUMN workflow_id TEXT,
    ADD CONSTRAINT fk_document_request_workflow_id
        FOREIGN KEY(workflow_id) 
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED,
    DROP CONSTRAINT document_request_scoped_vault_id_key;

CREATE INDEX document_request_workflow_id ON document_request(workflow_id);

-- Custom uniqueness handling while we are still migrating to workflows
CREATE UNIQUE INDEX document_request_unique_scoped_vault_id ON document_request(scoped_vault_id) WHERE workflow_id IS NULL;
CREATE UNIQUE INDEX document_request_unique_workflow_id ON document_request(workflow_id) WHERE workflow_id IS NOT NULL;