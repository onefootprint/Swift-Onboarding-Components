ALTER TABLE risk_signal_group ADD COLUMN workflow_id TEXT,
ADD CONSTRAINT fk_risk_signal_group_workflow
    FOREIGN KEY (workflow_id)
    REFERENCES workflow (id);
