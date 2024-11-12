DELETE FROM audit_event
WHERE name  = 'org_member_joined'
AND principal_actor IS NULL;


