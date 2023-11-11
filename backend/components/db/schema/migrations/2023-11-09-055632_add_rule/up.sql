CREATE TABLE rule_instance (
    id text PRIMARY KEY DEFAULT prefixed_uid('ru_'),
	created_at TIMESTAMPTZ NOT NULL,
    created_seqno BIGINT NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    deactivated_seqno BIGINT,
    rule_id TEXT NOT NULL,
	ob_configuration_id TEXT NOT NULL, -- for now, later to be replaced with rule_set_id
    actor JSONB NOT NULL,
	name TEXT,
	rule_expression TEXT NOT NULL,
	action TEXT NOT NULL,
	is_shadow BOOLEAN not null,

    CONSTRAINT rule_instance_ob_configuration_id
       FOREIGN KEY(ob_configuration_id) 
       REFERENCES ob_configuration(id)
       DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS rule_instance_ob_configuration_id ON rule_instance(ob_configuration_id);
SELECT diesel_manage_updated_at('rule_instance');
CREATE UNIQUE INDEX rule_instance_one_active_per_rule_id ON rule_instance(rule_id) WHERE deactivated_at IS NULL;