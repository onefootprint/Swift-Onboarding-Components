ALTER TABLE document_request
    DROP COLUMN workflow_id;

ALTER TABLE document_request ADD UNIQUE (scoped_vault_id);