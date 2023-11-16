CREATE TABLE rule_set_result (
    id text PRIMARY KEY DEFAULT prefixed_uid('rsr_'),
	created_at TIMESTAMPTZ NOT NULL,
    created_seqno BIGINT NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	ob_configuration_id TEXT NOT NULL,
    scoped_vault_id TEXT NOT NULL,
    workflow_id TEXT,
    kind TEXT NOT NULL,
    action_triggered TEXT,

    CONSTRAINT fk_rule_set_result_ob_configuration_id
       FOREIGN KEY(ob_configuration_id) 
       REFERENCES ob_configuration(id)
       DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_rule_set_result_scoped_vault_id
       FOREIGN KEY(scoped_vault_id) 
       REFERENCES scoped_vault(id)
       DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_rule_set_result_ob_workflow_id
       FOREIGN KEY(workflow_id) 
       REFERENCES workflow(id)
       DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS rule_set_result_ob_configuration_id ON rule_set_result(ob_configuration_id);
CREATE INDEX IF NOT EXISTS rule_set_result_scoped_vault_id ON rule_set_result(scoped_vault_id);
CREATE INDEX IF NOT EXISTS rule_set_result_workflow_id ON rule_set_result(workflow_id);
SELECT diesel_manage_updated_at('rule_set_result');
