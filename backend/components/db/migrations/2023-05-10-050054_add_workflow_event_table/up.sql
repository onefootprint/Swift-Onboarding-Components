CREATE TABLE workflow_event  (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('wfe_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL,
    workflow_id TEXT NOT NULL,
    from_state TEXT NOT NULL,
    to_state TEXT NOT NULL,

    CONSTRAINT fk_workflow_event_workflow_id
        FOREIGN KEY(workflow_id) 
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('workflow_event');
CREATE INDEX IF NOT EXISTS workflow_event_workflow_id ON workflow_event(workflow_id);
