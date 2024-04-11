UPDATE tenant_role
SET name = 'Partner Admin'
WHERE
	is_immutable = true AND
	kind = 'compliance_partner_dashboard_user' AND
	scopes @> '{"{\"kind\": \"compliance_partner_admin\"}"}' AND
	name = 'CompliancePartnerAdmin';

UPDATE tenant_role
SET name = 'Partner Member'
WHERE
	is_immutable = true AND
	kind = 'compliance_partner_dashboard_user' AND
	scopes @> '{"{\"kind\": \"compliance_partner_read\"}"}' AND
	name = 'CompliancePartnerMember';
