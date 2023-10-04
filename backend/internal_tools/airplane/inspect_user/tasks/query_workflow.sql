select 
	wfe.id wfe_id,
  wfe.created_at,
  wfe.from_state,
  wfe.to_state,

	wf.id wf_id,
  wf.created_at,
  wf.completed_at,
  wf.deactivated_at,
  wf.kind,
  wf.state,
  wf.config,
  wf.fixture_result,
  wf.status,    
  wf.authorized_at,
  wf.decision_made_at,
  wf.ob_configuration_id,

  obc.tenant_id,
  t.name tenant,  
  obc.key,
  obc.name,
  obc.is_live obc_is_live,
  obc.must_collect_data obc_must_collect_data,
  obc.can_access_data obc_can_access_data,
  obc.optional_data obc_optional_data,
  obc.enhanced_aml obc_enhanced_aml,
  obc.is_doc_first obc_is_doc_first,
  obc.allow_international_residents obc_allow_international_residents,
  obc.international_country_restrictions obc_international_country_restrictions,
  obc.doc_scan_for_optional_ssn obc_doc_scan_for_optional_ssn,
  obc.skip_kyc obc_skip_kyc,
  obc.is_no_phone_flow obc_is_no_phone_flow
from workflow wf
inner join scoped_vault sv on sv.id = wf.scoped_vault_id
left join workflow_event wfe on wfe.workflow_id = wf.id
left join ob_configuration obc on wf.ob_configuration_id = obc.id
left join tenant t on obc.tenant_id = t.id
where 
sv.fp_id = :fp_id
order by wf.created_at asc