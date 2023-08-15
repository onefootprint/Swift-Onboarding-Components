ALTER TABLE user_consent ADD COLUMN workflow_id TEXT;
ALTER TABLE user_consent ADD CONSTRAINT fk_user_consent_workflow_id
        FOREIGN KEY(workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS user_consent_workflow_id ON user_consent(workflow_id);