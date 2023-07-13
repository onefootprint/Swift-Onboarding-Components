UPDATE tenant_role
SET scopes = ARRAY_REPLACE(scopes, jsonb_build_object('kind', 'manage_vault_proxy'), jsonb_build_object('kind', 'vault_proxy'))
WHERE scopes @> ARRAY[jsonb_build_object('kind', 'manage_vault_proxy')];