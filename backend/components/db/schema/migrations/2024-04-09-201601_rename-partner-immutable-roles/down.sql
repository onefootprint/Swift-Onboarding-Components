UPDATE tenant_role
SET name = 'CompliancePartnerAdmin'
WHERE
	is_immutable = true AND
	kind = 'compliance_partner_dashboard_user' AND
	scopes @> '{"{\"kind\": \"compliance_partner_admin\"}"}' AND
	name = 'Partner Admin';

UPDATE tenant_role
SET name = 'CompliancePartnerMember'
WHERE
	is_immutable = true AND
	kind = 'compliance_partner_dashboard_user' AND
	scopes @> '{"{\"kind\": \"compliance_partner_read\"}"}' AND
	name = 'Partner Member';
