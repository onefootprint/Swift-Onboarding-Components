import airplane from 'airplane';
import { Client } from 'pg';
import { pg_query } from '../utils';

export default airplane.task(
  {
    slug: 'report_overdue_watchlist_checks',
    name: 'Report Overdue Watchlist Checks',
    parameters: {},
    envVars: {
      DATABASE_URL: { config: 'DATABASE_URL' },
    },
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            once_per_day: {
              cron: '0 17 * * *',
              description: 'Runs once per day at 17:00 UTC',
            },
          }
        : {},
  },
  async params => {
    const dbUrl = process.env.DATABASE_URL;

    let query = `
      with max_wf_completed_at_at_per_sv_id as (
        select wf.scoped_vault_id, max(wf.completed_at) as max_completed_at
        from workflow wf
        inner join scoped_vault sv on wf.scoped_vault_id = sv.id
        left join ob_configuration obc on wf.ob_configuration_id = obc.id
        where 
          wf.completed_at is not null and
          (	
            sv.tenant_id = 'org_PtnIJT4VR35BS9xy0wITgF'
            or obc.enhanced_aml->'data'->>'continuous_monitoring' = 'true'
          )
        group by 1
      )
      select 
        sv.tenant_id,
        sv.id sv_id,
        wf.max_completed_at wf_max_completed_at,
        wc.completed_at latest_watchlist_check_completed_at
      from 
        scoped_vault sv
        inner join vault v
          on sv.vault_id = v.id
        left join max_wf_completed_at_at_per_sv_id wf
          on wf.scoped_vault_id = sv.id
        left join watchlist_check wc
          on wc.scoped_vault_id = sv.id and wc.deactivated_at is null and wc.completed_at is not null
      where
        sv.is_live 
        and v.kind = 'person'
        and sv.tenant_id not in ('org_e2FHVfOM5Hd3Ce492o5Aat', 'org_hyZP3ksCvsT0AlLqMZsgrI') and sv.tenant_id not like '_private_it_org_%'
        and (wc.completed_at is null or wc.completed_at < now() - interval '31 day')
        and (
            (sv.tenant_id = 'org_PtnIJT4VR35BS9xy0wITgF' and wf.max_completed_at is null)
            or (wf.max_completed_at is not null and wf.max_completed_at < now() - interval '31 day')
      )
    `;

    const rows = await pg_query(dbUrl, query);
    if (rows.length > 0) {
      const message = `* ${
        rows.length
      } Overdue WatchlistCheck's Found!!* (showing first 30)\n${rows
        .slice(0, 30) // only show first 30 so we don't barf too hard on Slack
        .map(e => `(${e['tenant_id']}, ${e['sv_id']})`)
        .join(', ')}`;
      await airplane.slack.message('risk-alerts', message);
      throw message;
    }
    return rows;
  },
);
