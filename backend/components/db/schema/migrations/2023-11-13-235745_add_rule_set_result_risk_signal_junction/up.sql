CREATE TABLE rule_set_result_risk_signal_junction (
    id text PRIMARY KEY DEFAULT prefixed_uid('rsr_rs_'),
	created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    rule_set_result_id TEXT NOT NULL,
    risk_signal_id TEXT NOT NULL,

    CONSTRAINT rule_set_result_risk_signal_junction_rule_set_result_id
       FOREIGN KEY(rule_set_result_id) 
       REFERENCES rule_set_result(id)
       DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT rule_set_result_risk_signal_junction_risk_signal_id
       FOREIGN KEY(risk_signal_id) 
       REFERENCES risk_signal(id)
       DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS rule_set_result_risk_signal_junction_rule_set_result_id ON rule_set_result_risk_signal_junction(rule_set_result_id);
CREATE INDEX IF NOT EXISTS rule_set_result_risk_signal_junction_risk_signal_id ON rule_set_result_risk_signal_junction(risk_signal_id);
SELECT diesel_manage_updated_at('rule_set_result_risk_signal_junction');
