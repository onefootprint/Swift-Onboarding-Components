DELETE FROM audit_event
WHERE name IN ('create_org_api_key', 'update_org_api_key_status')
AND principal_actor IS NULL;