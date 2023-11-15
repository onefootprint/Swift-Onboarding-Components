import airplane from 'airplane';
import { pad, tenant_name_to_emoji } from '../../onboardings/tasks/utils';

export default airplane.task(
  {
    slug: 'report_unvalidated_users',
    name: 'Report Unvalidated Users',
    parameters: {},
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            every_thirty_minutes: {
              cron: '*/30 * * * *',
              description: 'Runs every 30 minutes',
            },
          }
        : {},
  },
  async params => {
    let end_datetime = new Date(
      new Date().getTime() - 1000, // Give a 1m grace period from completion -> validation
    ).toISOString();
    let start_datetime = new Date(
      new Date().getTime() - 1000 * 60 * 60, // Look back 1h
    ).toISOString();

    const run = await airplane.execute('query_unvalidated_users', {
      start_datetime: start_datetime,
      end_datetime: end_datetime,
    });
    let rows = (run.output as object)['Q1'];

    if (rows.length > 0) {
      function row_to_string(row) {
        let emoji = tenant_name_to_emoji.get(row['tenant_name']) ?? '';
        const columns = [
          pad(row['tenant_name'], 30),
          pad(row['fp_id'], 30),
          pad(row['workflow_id'], 30),
          pad(row['workflow_completed_at'], 30),
        ].join('|');
        return `${emoji} \`${columns}\``;
      }

      const header = `*${rows.length} Users that haven't been validated (showing first 30)*`;
      const columns = [
        pad('tenant', 30),
        pad('fp_id', 30),
        pad('workflow_id', 30),
        pad('workflow_completed_at', 30),
      ].join('|');
      const th = `:penguin-chill: *\`${columns}\`*`;
      const lines = rows.slice(0, 30).map(row_to_string);
      const message = [header, th].concat(lines).join('\n');

      console.log('message', message);
      await airplane.slack.message('alerts-backend', message);
    }

    return rows;
  },
);
