-- Replace the old jsonb column with an array column, and update the representation of the scopes
-- do use dot notation rather than a json object

ALTER TABLE tenant_role RENAME COLUMN scopes TO old_scopes;
ALTER TABLE tenant_role ADD COLUMN scopes TEXT[];

UPDATE tenant_role
SET scopes = (
    SELECT array_agg(scope->>'kind')
    FROM jsonb_array_elements(old_scopes) as scope
);

ALTER TABLE tenant_role
    DROP COLUMN old_scopes,
    ALTER COLUMN scopes SET NOT NULL;