CREATE TABLE workflow_request_junction (
    id text PRIMARY KEY DEFAULT prefixed_uid('wfrj_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    kind TEXT NOT NULL,
    workflow_request_id TEXT NOT NULL,
    scoped_vault_id TEXT NOT NULL,
    workflow_id TEXT,
    CONSTRAINT fk_workflow_request_junction_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_workflow_request_junction_workflow_request_id
        FOREIGN KEY(workflow_request_id) 
        REFERENCES workflow_request(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX workflow_request_junction_unique_workflow_request_id_kind ON workflow_request_junction (workflow_request_id, kind);
