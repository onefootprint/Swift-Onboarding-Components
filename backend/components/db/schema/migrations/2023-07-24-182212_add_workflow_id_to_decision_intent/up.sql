ALTER TABLE decision_intent
    ADD COLUMN workflow_id TEXT,
    ADD CONSTRAINT fk_decision_intent_workflow_id
        FOREIGN KEY(workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX decision_intent_workflow_id ON decision_intent(workflow_id);