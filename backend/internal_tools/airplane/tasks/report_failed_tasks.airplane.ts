import airplane from 'airplane';
import { pg_query } from '../utils';

export default airplane.task(
  {
    slug: 'report_failed_tasks',
    name: 'Report Failed Tasks',
    parameters: {},
    envVars: {
      DATABASE_URL: { config: 'DATABASE_URL' },
    },
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            every_two_minutes: {
              cron: '*/15 * * * *',
              description: 'Runs every 15 minutes',
            },
          }
        : {},
  },
  async params => {
    const dbUrl = process.env.DATABASE_URL;
    let query = `
      select
        *
      from task
      where 
        created_at > now() - interval '1 hour'
        and status = 'failed'
    `;

    const rows = await pg_query(dbUrl, query);
    if (rows.length > 0) {
      const message = `* ${
        rows.length
      } Failed Tasks From Last Hour* (showing first 30)\n${rows
        .slice(0, 30) // only show first 30 so we don't barf too hard on Slack
        .map(e => `(${e['id']} ${e['task_data']['kind']})`)
        .join(', ')}`;
      await airplane.slack.message('risk-alerts', message);
      throw message;
    }
    return rows;
  },
);
