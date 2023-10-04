select 
	rsg.id rsg_id,
 	rsg.created_at rsg_created_at,
    rsg.kind rsg_kind,
    rs.id rs_id,
    rs.reason_code,
	rs.vendor_api,
	rs.verification_result_id,
    rs.hidden
from risk_signal_group rsg
left join risk_signal rs on rs.risk_signal_group_id = rsg.id
inner join scoped_vault sv on rsg.scoped_vault_id = sv.id
where 
	sv.fp_id = :fp_id
order by rsg.created_at asc