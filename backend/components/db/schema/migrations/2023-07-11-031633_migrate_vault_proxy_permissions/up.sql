UPDATE tenant_role
-- All existing roles that have `vault_proxy` perms really only want the ability to manage vault proxies, not invoke them
SET scopes = ARRAY_REPLACE(scopes, jsonb_build_object('kind', 'vault_proxy'), jsonb_build_object('kind', 'manage_vault_proxy'))
WHERE scopes @> ARRAY[jsonb_build_object('kind', 'vault_proxy')];