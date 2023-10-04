select 
	dr.workflow_id,
	dr.id dr_id,
    dr.ref_id,
    dr.created_at dr_created_at,
    dr.should_collect_selfie,
    dr.global_doc_types_accepted,
    dr.country_restrictions,
    dr.country_doc_type_restrictions,
	
	id.id id_id,
    id.document_type,
    id.country_code,
    id.created_at id_created_at,
    id.document_score,
    id.selfie_score,
    id.ocr_confidence_score,
    id.status,
    id.fixture_result,
    id.skip_selfie,
    id.device_type

from document_request dr 
left join identity_document id on id.request_id = dr.id
inner join scoped_vault sv on dr.scoped_vault_id = sv.id
where 
  sv.fp_id = :fp_id
order by dr.created_at asc