import airplane from 'airplane';
import { pg_query } from '../utils';

export default airplane.task(
  {
    slug: 'report_pending_tasks',
    name: "Report Pending ScopedVault's/Workflow's",
    parameters: {},
    envVars: {
      DATABASE_URL: { config: 'DATABASE_URL' },
    },
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            every_three_minutes: {
              cron: '*/3 * * * *',
              description: 'Runs every 3 minutes',
            },
          }
        : {},
  },
  async params => {
    const dbUrl = process.env.DATABASE_URL;
    let query = `
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
        t.id != '_private_it_org_2'
        and greatest(psv.sv_created_at, wf.wf_created_at, wfe.wfe_created_at) >= now() - interval '3 day'
        and greatest(psv.sv_created_at, wf.wf_created_at, wfe.wfe_created_at) < now() - interval '2 minute'
    `;

    const rows = await pg_query(dbUrl, query);
    if (rows.length > 0) {
      const message = `* ${
        rows.length
      } ScopedVault's/Workflow's Stuck in Pending* (showing first 30)\n${rows
        .slice(0, 30) // only show first 30 so we don't barf too hard on Slack
        .map(e => JSON.stringify(e))
        .join(', ')}`;
      await airplane.slack.message('risk-alerts', message);
      throw message;
    }
    return rows;
  },
);
