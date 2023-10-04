select 
	  ivse.id ivse_id,
    ivse.created_at ivse_created_at,
    ivse.incode_verification_session_state,
    ivse.latest_failure_reasons,
    	
	  ivs.id ivs_id,
    ivs.created_at ivs_created_at,
    ivs.state ivs_state,
    ivs.completed_at,
    ivs.kind,
    ivs.latest_failure_reasons,
    ivs.incode_session_id,
  	case 
  		when ivs.incode_session_id is not null
  		then 'https://dashboard.incode.com/single-session/' || cast(ivs.incode_session_id as varchar) 
  	end inc_link,
    ivs.incode_configuration_id
    
from incode_verification_session ivs
inner join identity_document id on ivs.identity_document_id = id.id
inner join document_request dr on id.request_id = dr.id
inner join scoped_vault sv on dr.scoped_vault_id = sv.id
left join incode_verification_session_event ivse on ivse.incode_verification_session_id = ivs.id
where 
  sv.fp_id = :fp_id
order by ivse.created_at asc