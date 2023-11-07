import airplane from 'airplane';
import { rows_to_message } from './utils';

export default airplane.task(
  {
    slug: 'report_recent_onboardings_pass',
    name: 'Report Recent Pass Onboardings',
    parameters: {},
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            every_five_minutes: {
              cron: '*/5 * * * *',
              description: 'Runs every 5 minutes',
            },
          }
        : {},
  },
  async params => {
    let end_datetime = new Date().toISOString();
    let start_datetime = new Date(
      new Date().getTime() - 1000 * 60 * 5 - 20,
    ).toISOString();

    const run = await airplane.execute('query_onboardings', {
      start_datetime: start_datetime,
      end_datetime: end_datetime,
      tenant: null,
      status: 'pass',
    });
    let rows = (run.output as object)['Q1'];

    if (rows.length > 0) {
      const message = rows_to_message(rows);
      await airplane.slack.message('risk-onboardings-pass', message);
    }

    return rows;
  },
);
