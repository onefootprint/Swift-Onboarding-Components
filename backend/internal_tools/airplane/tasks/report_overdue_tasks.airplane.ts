import airplane from 'airplane';
import { Client } from 'pg';
import { pg_query } from '../utils';

export default airplane.task(
  {
    slug: 'report_overdue_tasks',
    name: 'Report Overdue Tasks',
    parameters: {},
    envVars: {
      DATABASE_URL: { config: 'DATABASE_URL' },
    },
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            every_four_hours: {
              cron: '0 */3 * * *',
              description: 'Runs every 3 hours',
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
        scheduled_for + interval '2 hour' < now()
        and task.status not in ('failed', 'completed')
    `;

    const rows = await pg_query(dbUrl, query);
    if (rows.length > 0) {
      const message = `* ${
        rows.length
      } Overdue Tasks Found* (showing first 30)\n${rows
        .slice(0, 30) // only show first 30 so we don't barf too hard on Slack
        .map(e => `(${e['id']} ${e['task_data']['kind']})`)
        .join(', ')}`;
      await airplane.slack.message('risk-alerts', message);
      throw message;
    }
    return rows;
  },
);
