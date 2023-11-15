with pending_scoped_vaults as (
  select 
    id sv_id,
  start_timestamp sv_created_at, 
    status sv_status
  from scoped_vault 
  where 
    status = 'pending'
),
pending_workflows as (
  select
  id wf_id,
    scoped_vault_id sv_id,
    created_at wf_created_at,
  status wf_status
  from workflow
  where 
  status = 'pending'
),
pending_workflows_latest_workflow_event as (
  select
    distinct on (wf.wf_id)
    wf.wf_id, 
    created_at wfe_created_at
  from pending_workflows wf
  inner join workflow_event wfe on wf.wf_id = wfe.workflow_id
  order by wf.wf_id, wfe.created_at desc
)

select 
  t.name tenant_name, t.id tenant_id,
  coalesce(psv.sv_id, wf.sv_id) sv_id,
  psv.sv_created_at, psv.sv_status, wf.wf_created_at, wfe_created_at, wf.wf_status, wf.wf_id
from pending_scoped_vaults psv
full outer join pending_workflows wf on psv.sv_id = wf.sv_id
left join pending_workflows_latest_workflow_event wfe on wf.wf_id = wfe.wf_id
inner join scoped_vault sv on sv.id = coalesce(psv.sv_id, wf.sv_id)
inner join tenant t on sv.tenant_id = t.id
where 
  t.is_demo_tenant = 'f'
  and sv.is_live
  and greatest(psv.sv_created_at, wf.wf_created_at, wfe.wfe_created_at) >= :start_datetime
  and greatest(psv.sv_created_at, wf.wf_created_at, wfe.wfe_created_at) <  :end_datetime
  