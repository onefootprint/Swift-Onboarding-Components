ALTER TABLE onboarding_decision
    ADD COLUMN rule_set_result_id TEXT,
    ADD CONSTRAINT fk_onboarding_decision_rule_set_result_id
        FOREIGN KEY(rule_set_result_id)
        REFERENCES rule_set_result(id)
        DEFERRABLE INITIALLY DEFERRED;
