ALTER TABLE tenant_role RENAME COLUMN scopes TO old_scopes;
ALTER TABLE tenant_role ADD COLUMN scopes JSONB;

UPDATE tenant_role
SET scopes = (
    SELECT jsonb_agg(jsonb_build_object('kind', scope))
    FROM unnest(old_scopes) as scope
);

ALTER TABLE tenant_role
    DROP COLUMN old_scopes,
    ALTER COLUMN scopes SET NOT NULL;