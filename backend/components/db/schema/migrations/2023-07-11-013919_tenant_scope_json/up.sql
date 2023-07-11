ALTER TABLE tenant_role
    ADD COLUMN scopes_json JSONB[];

UPDATE tenant_role
SET scopes_json = (
    SELECT array_agg(CASE
        WHEN scope = ANY(ARRAY['read', 'admin', 'onboarding_configuration', 'api_keys', 'org_settings', 'vault_proxy', 'manual_review', 'write_entities', 'decrypt_custom', 'decrypt_all', 'cip_integration', 'trigger_kyc']) THEN jsonb_build_object('kind', scope)
        WHEN scope = 'decrypt.document' THEN jsonb_build_object('kind', 'decrypt_document')
        WHEN scope = 'decrypt.document_and_selfie' THEN jsonb_build_object('kind', 'decrypt_document_and_selfie')
        WHEN scope LIKE 'decrypt.%' THEN jsonb_build_object('kind', 'decrypt', 'data', substring(scope FROM 9))
        ELSE NULL
    END)
    FROM unnest(scopes) as scope
);

-- TODO will drop this in next PR, keeping around for reverting if needed
ALTER TABLE tenant_role RENAME COLUMN scopes TO scopes_old;
ALTER TABLE tenant_role RENAME COLUMN scopes_json TO scopes;
ALTER TABLE tenant_role ALTER COLUMN scopes_old DROP NOT NULL;
ALTER TABLE tenant_role ALTER COLUMN scopes SET NOT NULL;