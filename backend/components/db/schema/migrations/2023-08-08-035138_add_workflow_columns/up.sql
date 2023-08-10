ALTER TABLE workflow
    ADD COLUMN status TEXT,
    ADD COLUMN ob_configuration_id TEXT,
    ADD COLUMN insight_event_id TEXT,
    ADD COLUMN authorized_at TIMESTAMPTZ,
    ADD CONSTRAINT fk_workflow_ob_configuration_id
        FOREIGN KEY (ob_configuration_id)
        REFERENCES ob_configuration(id)
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_workflow_insight_event_id
        FOREIGN KEY (insight_event_id)
        REFERENCES insight_event(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS workflow_ob_configuration_id ON workflow(ob_configuration_id);
CREATE INDEX IF NOT EXISTS workflow_insight_event_id ON workflow(insight_event_id);

ALTER TABLE scoped_vault ADD COLUMN status TEXT;