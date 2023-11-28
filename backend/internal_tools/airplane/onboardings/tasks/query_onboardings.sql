with workflows as (
  select
  	wf.id,
	wf.completed_at completed_at,
	t.name tenant_name,
	t.id tenant_id,
    sv.fp_id,
    sv.id sv_id
  from workflow wf 
  inner join scoped_vault sv on wf.scoped_vault_id = sv.id
  inner join tenant t on sv.tenant_id = t.id
  where 
      sv.tenant_id not like '_private_it_org_%'
      and sv.is_live
      and wf.completed_at is not null
      and (sv.tenant_id = :tenant or t.name ilike '%'||:tenant||'%' or ''||:tenant is null)
      and (wf.completed_at >= :start_datetime or ''||:start_datetime is null)
      and (wf.completed_at <= :end_datetime or ''||:end_datetime is null)
 order by wf.completed_at desc
 limit 300
),
latest_rsgs as (
  select 
      distinct on (wf.id, rsg.kind)
      rsg.id rsg_id, wf.id wf_id
  from risk_signal_group rsg
  inner join scoped_vault sv on rsg.scoped_vault_id = sv.id
  inner join workflows wf on wf.sv_id = sv.id
  order by wf.id, rsg.kind, rsg.created_at desc
),
risk_signal_agg as (
  select
	rsg.wf_id,
  	array_agg(rs.reason_code) bad_rs
  from risk_signal rs 
  inner join latest_rsgs rsg on rs.risk_signal_group_id = rsg.rsg_id
  where rs.reason_code in (
    'id_not_located',
    'subject_deceased',
    'address_input_is_po_box',
    'dob_located_coppa_alert',
    'multiple_records_found',
    'watchlist_hit_pep',
    'document_not_verified',
    'document_selfie_does_not_match',
    'watchlist_hit_ofac',
    'watchlist_hit_non_sdn',
    'watchlist_hit_pep',
    'adverse_media_hit',
    'attested_device_fraud_duplicate_risk_medium',
    'attested_device_fraud_duplicate_risk_high',
    'document_barcode_could_not_be_read',
    'document_expired',
    'document_upload_failed',
    'document_type_mismatch',
    'document_unknown_country_code',
    'document_country_code_mismatch',
    'document_not_verified',
    'document_verified',
    'document_is_permit_or_provisional_license',
    'id_flagged',
    'ssn_issued_prior_to_dob',
    'ssn_not_available',
    'ssn_partially_matches',
    'ssn_does_not_match',
    'document_selfie_not_live_image',
    'ssn_does_not_match_within1_digit',
    'ssn_input_is_itin',
    'ssn_located_is_itin',
    'ssn_input_tied_to_multiple_names',
    'ssn_input_is_invalid',
    'ssn_located_is_invalid',
    'ssn_not_provided',
    'address_does_not_match',
    'address_newer_record_found',
    'name_does_not_match',
    'name_partially_matches',
    'dob_does_not_match',
    'dob_partial_match',
    'dob_not_on_file',
    'dob_could_not_match'
  )
  group by 1
),
latest_doc as (
  select
    distinct on (wf.id) 
    wf.id wf_id, ivs.incode_session_id, ivs.latest_failure_reasons, id.document_type
  from workflows wf 
  left join document_request dr on dr.workflow_id = wf.id
  left join identity_document id on id.request_id = dr.id
  left join incode_verification_session ivs on ivs.identity_document_id = id.id 
  order by wf.id, id.created_at desc
),
all_doc_errors as (
  select wf_id, array_agg(distinct(latest_failure_reasons)) doc_failure_reasons
  from (
    select
      wf.id wf_id, unnest(ivs.latest_failure_reasons) latest_failure_reasons
    from workflows wf 
    left join document_request dr on dr.workflow_id = wf.id
    left join identity_document id on id.request_id = dr.id
    left join incode_verification_session ivs on ivs.identity_document_id = id.id 
  ) t
  group by 1
)

select 
	wf.completed_at, wf.tenant_name, wf.tenant_id, wf.fp_id,
    
    obd.status,
    'https://dashboard.onefootprint.com/assume'||:q||'tenantId=' || wf.tenant_id assume,
    'https://dashboard.onefootprint.com/users/' || wf.fp_id user_dash,
    
	case 
  		when doc.incode_session_id is not null
  		then 'https://dashboard.incode.com/single-session/' || cast(doc.incode_session_id as varchar) 
        end inc_link,
	rsa.bad_rs,
  doc.document_type,
  doc_err.doc_failure_reasons

from workflows wf 
left join onboarding_decision obd 
	on (obd.workflow_id = wf.id and obd.actor->>'kind' = 'footprint')
left join latest_doc doc on doc.wf_id = wf.id
left join all_doc_errors doc_err on doc_err.wf_id = wf.id
left join risk_signal_agg rsa on rsa.wf_id = wf.id 
where 
   (obd.status = :status or ''||:status is null or :status = '')
order by completed_at desc
