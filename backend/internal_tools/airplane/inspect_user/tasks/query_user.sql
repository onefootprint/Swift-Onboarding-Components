select 
	t.id tenant_id,
    t.name tenant_name,
    'https://dashboard.onefootprint.com/assume'||:q||'tenantId=' || t.id assume,
	'https://dashboard.onefootprint.com/users/' || sv.fp_id user_dash,
    sv.fp_id,
	sv.id sv_id,
   	sv.vault_id,
	sv._created_at sv_created_at,
    sv.start_timestamp,
    sv.is_live,
    sv.status,
    
    v.id v_id,
    v._created_at v_created_at,
    v.is_portable,
    v.kind,
    v.is_fixture,
    v.sandbox_id

from scoped_vault sv
inner join tenant t on sv.tenant_id = t.id
inner join vault v on sv.vault_id = v.id
where 
    sv.fp_id = :fp_id
order by sv._created_at asc