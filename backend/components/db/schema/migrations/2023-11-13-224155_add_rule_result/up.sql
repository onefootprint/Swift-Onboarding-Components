CREATE TABLE rule_result (
    id text PRIMARY KEY DEFAULT prefixed_uid('rr_'),
	created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    rule_instance_id TEXT NOT NULL,
    rule_set_result_id TEXT NOT NULL,
    result BOOLEAN NOT NULL,

    CONSTRAINT rule_result_rule_instance_id
       FOREIGN KEY(rule_instance_id) 
       REFERENCES rule_instance(id)
       DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT rule_result_rule_set_result_id
       FOREIGN KEY(rule_set_result_id) 
       REFERENCES rule_set_result(id)
       DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS rule_result_rule_instance_id ON rule_result(rule_instance_id);
CREATE INDEX IF NOT EXISTS rule_result_rule_set_result_id ON rule_result(rule_set_result_id);
SELECT diesel_manage_updated_at('rule_result');
CREATE UNIQUE INDEX rule_result_one_rule_instance_id_per_rule_set_result_id ON rule_result(rule_instance_id, rule_set_result_id);
