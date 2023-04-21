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
      select 
        sv.tenant_id,
        sv.id sv_id,
        ob.decision_made_at onboarding_decision_made_at,
        wc.completed_at latest_watchlist_check_completed_at
      from 
        scoped_vault sv
        inner join vault v
          on sv.vault_id = v.id
        left join onboarding ob
          on ob.scoped_vault_id = sv.id
        left join watchlist_check wc
          on wc.scoped_vault_id = sv.id and wc.deactivated_at is null and wc.completed_at is not null
      where
        sv.is_live 
        and v.kind = 'person'
        and sv.tenant_id in ('org_PtnIJT4VR35BS9xy0wITgF')
        and (wc.completed_at is null or wc.completed_at < now() - interval '31 day')
        and (ob.decision_made_at is not null and ob.decision_made_at < now() - interval '31 day');
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
