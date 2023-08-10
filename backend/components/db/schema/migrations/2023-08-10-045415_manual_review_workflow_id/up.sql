SET CONSTRAINTS ALL IMMEDIATE;

ALTER TABLE manual_review
    ADD COLUMN workflow_id TEXT,
    ADD COLUMN scoped_vault_id TEXT,
    ADD CONSTRAINT fk_manual_review_workflow_id
        FOREIGN KEY (workflow_id)
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_manual_review_scoped_vault_id
        FOREIGN KEY (scoped_vault_id)
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED;

UPDATE manual_review
SET workflow_id = onboarding.workflow_id, scoped_vault_id = onboarding.scoped_vault_id
FROM onboarding
WHERE manual_review.onboarding_id = onboarding.id;

CREATE INDEX IF NOT EXISTS manual_review_workflow_id ON manual_review(workflow_id);
CREATE INDEX IF NOT EXISTS manual_review_scoped_vault_id ON manual_review(scoped_vault_id);

CREATE UNIQUE INDEX manual_review_unique_workflow_id ON manual_review(workflow_id) WHERE completed_at IS NULL;

ALTER TABLE manual_review
    ALTER COLUMN workflow_id SET NOT NULL,
    ALTER COLUMN scoped_vault_id SET NOT NULL,
    ALTER COLUMN onboarding_id DROP NOT NULL;