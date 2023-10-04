select 
  wc.id wc_id,
  wc.created_at,
	wc.completed_at,
	wc.deactivated_at,
  wc.status,
	wc.status_details,    
  wc.reason_codes,  
	wc.task_id,
  wc.decision_intent_id,
	wc.scoped_vault_id
from watchlist_check wc
inner join scoped_vault sv on sv.id = wc.scoped_vault_id
where 
sv.fp_id = :fp_id
order by wc.created_at desc