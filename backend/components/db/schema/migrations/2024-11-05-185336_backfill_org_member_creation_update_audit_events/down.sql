DELETE FROM audit_event
WHERE name IN ('create_org_role', 'deactivate_org_role')
AND metadata->>'kind' IN ('create_org_role', 'deactivate_org_role')
AND principal_actor IS NULL;