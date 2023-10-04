select 
	mr.id mr_id,
	mr.timestamp,
  mr.completed_at,
  mr.completed_by_actor,
  mr.completed_by_decision_id,
  mr.review_reasons,
	mr.workflow_id
from manual_review mr
inner join scoped_vault sv on mr.scoped_vault_id = sv.id
where 
	sv.fp_id = :fp_id
order by mr.timestamp asc