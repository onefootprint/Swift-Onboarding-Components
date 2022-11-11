CREATE TABLE manual_review (
    id text PRIMARY KEY DEFAULT prefixed_uid('mr_'),
    timestamp TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    onboarding_id UUID NOT NULL,
    completed_at TIMESTAMPTZ,
    completed_by_decision_id TEXT,
    completed_by_tenant_user_id TEXT,
    CONSTRAINT fk_manual_review_onboarding_id
        FOREIGN KEY(onboarding_id)
        REFERENCES onboarding(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_manual_review_completed_by_decision_id
        FOREIGN KEY(completed_by_decision_id)
        REFERENCES onboarding_decision(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_manual_review_completed_by_tenant_user_id
        FOREIGN KEY(completed_by_tenant_user_id)
        REFERENCES tenant_user(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS manual_review_onboarding_id ON manual_review(onboarding_id);
CREATE INDEX IF NOT EXISTS manual_review_completed_by_decision_id ON manual_review(completed_by_decision_id);
CREATE INDEX IF NOT EXISTS manual_review_completed_by_tenant_user_id ON manual_review(completed_by_tenant_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS manual_review_unique_onboarding_id ON manual_review(onboarding_id) WHERE completed_at IS NULL;

SELECT diesel_manage_updated_at('manual_review');


-- These are just straggler changes that were forgetten in a previous PR. Sorry!
ALTER TABLE annotation ALTER CONSTRAINT fk_annotation_scoped_user_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE annotation ALTER CONSTRAINT fk_annotation_tenant_user_id DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE liveness_event ALTER CONSTRAINT fk_liveness_event_insight_event_id DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE liveness_event ALTER CONSTRAINT fk_liveness_onboarding_id DEFERRABLE INITIALLY DEFERRED;