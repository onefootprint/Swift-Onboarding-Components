CREATE TABLE workflow_request (
    id text PRIMARY KEY DEFAULT prefixed_uid('wfr_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    timestamp TIMESTAMPTZ NOT NULL,
    deactivated_at TIMESTAMPTZ,
    deactivated_by_workflow_id TEXT,
    scoped_vault_id TEXT NOT NULL,
    ob_configuration_id TEXT NOT NULL,
    created_by JSONB NOT NULL,
    CONSTRAINT fk_workflow_request_deactivated_by_workflow_id
        FOREIGN KEY(deactivated_by_workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_workflow_request_scoped_vault_id
        FOREIGN KEY(scoped_vault_id)
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_workflow_request_ob_configuration_id
        FOREIGN KEY(ob_configuration_id)
        REFERENCES ob_configuration(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS workflow_request_deactivated_by_workflow_id ON workflow_request(deactivated_by_workflow_id);
CREATE INDEX IF NOT EXISTS workflow_request_scoped_vault_id ON workflow_request(scoped_vault_id);
CREATE INDEX IF NOT EXISTS workflow_request_ob_configuration_id ON workflow_request(ob_configuration_id);
CREATE UNIQUE INDEX IF NOT EXISTS workflow_request_scoped_vault_id_unique ON workflow_request(scoped_vault_id) WHERE deactivated_at IS NULL;

SELECT diesel_manage_updated_at('workflow_request');