UPDATE tenant_role
SET name = 'Admin'
WHERE
	is_immutable = true AND
	kind = 'compliance_partner_dashboard_user' AND
	scopes @> '{"{\"kind\": \"compliance_partner_admin\"}"}' AND
	(name = 'Partner Admin' OR name = 'CompliancePartnerAdmin');

UPDATE tenant_role
SET name = 'Member'
WHERE
	is_immutable = true AND
	kind = 'compliance_partner_dashboard_user' AND
	scopes @> '{"{\"kind\": \"compliance_partner_read\"}"}' AND
	(name = 'Partner Member' OR name = 'CompliancePartnerMember');
