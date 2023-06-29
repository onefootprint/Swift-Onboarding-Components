ALTER TABLE onboarding
    ADD COLUMN workflow_id TEXT,
    ADD CONSTRAINT fk_onboarding_workflow_id
        FOREIGN KEY(workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED;
    
CREATE INDEX onboarding_workflow_id ON onboarding(workflow_id);