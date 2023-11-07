import airplane from 'airplane';
import { pad, tenant_name_to_emoji } from '../onboardings/tasks/utils';

export default airplane.task(
  {
    slug: 'report_recent_pending_users',
    name: 'Report Recent Pending Users',
    parameters: {},
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
    let end_datetime = new Date(new Date().getTime() - 1000 * 5).toISOString(); // query up to current time minus a 5 second buffer so users who are transitioning out of pending in the few seconds this task runs are not erroneously alerted
    let start_datetime = new Date(
      new Date().getTime() - 1000 * (60 * 3 + 10), // query starting 3 minutes ago, plus another 10 second buffer since this task may start a few seconds after its strict starting time
    ).toISOString();

    console.log('start_datetime', start_datetime, 'end_datetime', end_datetime);

    const run = await airplane.execute('query_pending_users', {
      start_datetime: start_datetime,
      end_datetime: end_datetime,
    });
    let rows = (run.output as object)['Q1'];
    console.log('rows.length', rows.length);

    if (rows.length > 0) {
      function row_to_string(row) {
        let emoji = tenant_name_to_emoji.get(row['tenant_name']) ?? '';
        return `${emoji} \`${pad(row['tenant_name'], 30)}|${pad(
          row['sv_id'],
          30,
        )}|${pad(row['wf_id'], 30)}\``;
      }

      const message = `*${
        rows.length
      } New Users Stuck In Pending (showing first 30)*
  :penguin-chill: *\`${pad('_  tenant   ', 30)}|${pad('sv_id', 30)}|${pad(
        'wf_id',
        30,
      )}\`*
  ${rows
    .slice(0, 30)
    .map(r => row_to_string(r))
    .join('\n')}`;
      console.log('message', message);

      await airplane.slack.message('risk-alerts', message);
    }

    return rows;
  },
);
