ALTER TABLE annotation ADD COLUMN tenant_user_id TEXT;
UPDATE annotation SET tenant_user_id = CASE
    WHEN actor->>'kind' = 'tenant_user' then actor->'data'->>'id'
    ELSE NULL
END;
ALTER TABLE annotation DROP COLUMN actor;
ALTER TABLE annotation ADD CONSTRAINT fk_annotation_tenant_user_id FOREIGN KEY(tenant_user_id) REFERENCES tenant_user(id) DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS annotation_tenant_user_id ON annotation(tenant_user_id);


ALTER TABLE manual_review ADD COLUMN completed_by_tenant_user_id TEXT;
UPDATE manual_review SET completed_by_tenant_user_id = CASE
    WHEN completed_by_actor->>'kind' = 'tenant_user' then completed_by_actor->'data'->>'id'
    ELSE NULL
END;
ALTER TABLE manual_review DROP COLUMN completed_by_actor;


ALTER TABLE onboarding_decision ADD COLUMN tenant_user_id TEXT;
UPDATE onboarding_decision SET tenant_user_id = CASE
    WHEN actor->>'kind' = 'tenant_user' then actor->'data'->>'id'
    ELSE NULL
END;
ALTER TABLE onboarding_decision DROP COLUMN actor;
ALTER TABLE onboarding_decision ADD CONSTRAINT fk_onboarding_decision_tenant_user_id FOREIGN KEY(tenant_user_id) REFERENCES tenant_user(id) DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS onboarding_decision_tenant_user_id ON annotation(tenant_user_id);
