select
	dl.scoped_vault_id,
	dl.id dl_id,
    dl.created_at,
    dl.portablized_at,
    dl.deactivated_at,
    dl.kind,
    dl.source,

 	vd.id vd_id,
    vd.kind vd_kind,
    ci.id ci_id,

    ci.is_verified,
    ci.is_otp_verified,
    ci.priority,
    
    dd.id dd_id,
	dd.kind dd_kind,
    dd.mime_type,
    dd.filename,
    dd.s3_url

from data_lifetime dl 
left join vault_data vd on vd.lifetime_id = dl.id
left join contact_info ci on ci.lifetime_id = dl.id
left join document_data dd on dd.lifetime_id = dl.id
inner join scoped_vault sv on dl.scoped_vault_id = sv.id
where 
    sv.fp_id = :fp_id
order by dl.created_at asc