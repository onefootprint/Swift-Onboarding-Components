CREATE TABLE workflow  (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('wf_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL,
    scoped_vault_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    state TEXT NOT NULL,
    
    CONSTRAINT fk_workflow_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('workflow');
CREATE INDEX IF NOT EXISTS workflow_scoped_vault_id ON workflow(scoped_vault_id);
