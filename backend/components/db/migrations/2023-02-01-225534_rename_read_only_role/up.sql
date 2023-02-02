UPDATE tenant_role
SET name = 'Member'
WHERE name = 'Read-only' AND is_immutable ='t';