select 
  obd.id obd_id,
  obd.created_at created_at,
  obd.status,
  coalesce(obd.actor->'data'->>'id', obd.actor->>'kind') actor,
  obd.workflow_id
from onboarding_decision obd
inner join workflow wf on obd.workflow_id = wf.id
inner join scoped_vault sv on wf.scoped_vault_id = sv.id
where
  sv.fp_id = :fp_id
order by obd.created_at asc
