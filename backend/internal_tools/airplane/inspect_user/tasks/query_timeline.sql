select 
	ut.id,
	ut.timestamp,
	ut.event_kind,
  ut.event,
  ut.is_portable
from user_timeline ut
inner join scoped_vault sv on ut.scoped_vault_id = sv.id
where 
sv.fp_id = :fp_id
and sv.vault_id = ut.vault_id 
and (
  ut.scoped_vault_id is null 
  or ut.scoped_vault_id = sv.id
  or ut.is_portable
)
order by ut.timestamp desc