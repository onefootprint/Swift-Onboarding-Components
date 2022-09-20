-- First clear all permissions - they won't be deserializable with the near serialization scheme.
-- After deploy, we will have to manually re-instantiate the admin roles. But, don't want to do this
-- in the sql script since it could be dangerous to blindly give all roles admin access.
UPDATE tenant_role SET permissions = CAST(ARRAY[] AS TEXT[]);
ALTER TABLE tenant_role ALTER COLUMN permissions TYPE JSONB USING to_jsonb(permissions);