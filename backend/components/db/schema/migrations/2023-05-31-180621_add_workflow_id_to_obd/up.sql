ALTER TABLE onboarding_decision
    ADD COLUMN workflow_id TEXT,
    ADD CONSTRAINT fk_onboarding_decision_workflow_id
        FOREIGN KEY(workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED;
    
CREATE INDEX onboarding_decision_workflow_id ON onboarding_decision(workflow_id);