import airplane from 'airplane';
import { Client } from 'pg';
import { pg_query } from '../utils';
import { pad, tenant_name_to_emoji } from '../onboardings/tasks/utils';

export default airplane.task(
  {
    slug: 'report_recent_watchlist_checks',
    name: 'Report Recent Watchlist Checks',
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
        t.name tenant, coalesce(wc.status_details->>'data', wc.status) status, reason_codes, count(*) cnt
      from watchlist_check wc
      inner join scoped_vault sv on wc.scoped_vault_id = sv.id
      inner join tenant t on sv.tenant_id = t.id
      where 
        completed_at > now() - interval '24 hour'
      group by 1,2,3
      order by 1, 3 desc
    `;

    const rows = await pg_query(dbUrl, query);

    function row_to_string(row) {
      let emoji = tenant_name_to_emoji.get(row['tenant']) ?? '';
      return `${emoji} \`${pad(row['tenant'])}|${pad(row['status'])}|${pad(
        row['reason_codes'],
      )}|${pad(row['cnt'])}\``;
    }

    const message = `*Continuous Monitoring WatchlistCheck's*
:penguin-chill: *\`${pad('_  tenant   ')}|${pad('status')}|${pad(
      'reason_codes',
    )}|${pad('fail')}|${pad('count (past 1d)')}\`*
${rows.map(r => row_to_string(r)).join('\n')}`;
    console.log('message', message);

    await airplane.slack.message('risk-alerts', message);

    return rows;
  },
);
