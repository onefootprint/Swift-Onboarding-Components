UPDATE tenant_role
SET name = 'Read-only'
WHERE name = 'Member' AND is_immutable ='t';