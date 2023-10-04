select 
  t.id task_id,
  t.created_at,
  t.scheduled_for,
  t.status,
	t.num_attempts,
  t.task_data->>'kind' kind,
	t.task_data->'data'->'webhook_event' webhook_event,
	t.task_data
from task t
inner join scoped_vault sv on t.task_data->'data'->>'scoped_vault_id' = sv.id 
where 
sv.fp_id = :fp_id
order by t.created_at asc