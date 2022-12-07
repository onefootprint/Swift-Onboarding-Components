ALTER TABLE annotation ADD COLUMN actor jsonb;
UPDATE annotation SET actor = CASE
    WHEN tenant_user_id IS NOT NULL THEN json_build_object('kind', 'tenant_user', 'data', json_build_object('id', tenant_user_id))
    ELSE json_build_object('kind', 'footprint')
END;
ALTER TABLE annotation ALTER COLUMN actor SET NOT NULL, DROP COLUMN tenant_user_id;


ALTER TABLE manual_review ADD COLUMN completed_by_actor jsonb;
UPDATE manual_review SET completed_by_actor = CASE
    WHEN completed_at IS NULL then NULL
    WHEN completed_by_tenant_user_id IS NULL THEN json_build_object('kind', 'footprint')
    ELSE json_build_object('kind', 'tenant_user', 'data', json_build_object('id', completed_by_tenant_user_id))
END;
ALTER TABLE manual_review DROP COLUMN completed_by_tenant_user_id;


ALTER TABLE onboarding_decision ADD COLUMN actor jsonb;
UPDATE onboarding_decision SET actor = CASE
    WHEN tenant_user_id IS NOT NULL THEN json_build_object('kind', 'tenant_user', 'data', json_build_object('id', tenant_user_id))
    ELSE json_build_object('kind', 'footprint')
END;
ALTER TABLE onboarding_decision ALTER COLUMN actor SET NOT NULL, DROP COLUMN tenant_user_id;