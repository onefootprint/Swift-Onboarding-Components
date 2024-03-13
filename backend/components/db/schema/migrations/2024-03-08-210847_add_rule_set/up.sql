CREATE TABLE rule_set (
    id text PRIMARY KEY DEFAULT prefixed_uid('rsv_'),
	created_at TIMESTAMPTZ NOT NULL,
    created_seqno BIGINT NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    deactivated_seqno BIGINT,

    version INTEGER NOT NULL,
	ob_configuration_id TEXT NOT NULL,
    actor JSONB NOT NULL,

    CONSTRAINT fk_rule_set_ob_configuration_id
       FOREIGN KEY(ob_configuration_id) 
       REFERENCES ob_configuration(id)
       DEFERRABLE INITIALLY DEFERRED,
    
    CONSTRAINT rule_set_one_per_ob_configuration_id_version 
        UNIQUE(ob_configuration_id, version) 
        DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS rule_set_ob_configuration_id ON rule_set(ob_configuration_id);
SELECT diesel_manage_updated_at('rule_set');
CREATE UNIQUE INDEX rule_set_one_active_per_ob_configuration_id on rule_set(ob_configuration_id) WHERE deactivated_seqno IS NULL;
