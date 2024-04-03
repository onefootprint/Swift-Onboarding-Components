CREATE TABLE rule_instance_references_list(
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('ri_lst_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    rule_instance_id TEXT NOT NULL,
    list_id TEXT NOT NULL,

    CONSTRAINT fk_rule_instance_references_list_rule_instance_id
        FOREIGN KEY(rule_instance_id) 
        REFERENCES rule_instance(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_rule_instance_references_list_list_id
        FOREIGN KEY(list_id) 
        REFERENCES list(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT rule_instance_references_list_one_per_rule_instance_id_list_id 
        UNIQUE(rule_instance_id, list_id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('rule_instance_references_list');
CREATE INDEX IF NOT EXISTS rule_instance_references_list_rule_instance_id ON rule_instance_references_list(rule_instance_id);
CREATE INDEX IF NOT EXISTS rule_instance_references_list_list_id ON rule_instance_references_list(list_id);