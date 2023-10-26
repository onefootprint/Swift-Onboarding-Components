import airplane from 'airplane';
import { pad, tenant_name_to_emoji } from './utils';

export default airplane.task(
  {
    slug: 'report_tenant_stats',
    name: 'Report Tenant Stats',
    parameters: {},
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            every_six_hours: {
              cron: '0 */6 * * *',
              description: 'Runs every 6 hours',
            },
          }
        : {},
  },
  async params => {
    const run = await airplane.execute('query_tenant_stats', {});
    let rows = (run.output as object)['Q1'];

    function row_to_string(row) {
      let emoji = tenant_name_to_emoji.get(row['tenant']) ?? '';
      return `${emoji} \`${pad(row['tenant'])}|${pad(
        row['total__6h'] + '/' + row['total__7d'] + '/' + row['total__all'],
      )}|${pad(
        row['pass__6h'] + '/' + row['pass__7d'] + '/' + row['pass__all'],
      )}|${pad(
        row['fail__6h'] + '/' + row['fail__7d'] + '/' + row['fail__all'],
      )}|${pad(
        row['incomplete__6h'] +
          '/' +
          row['incomplete__7d'] +
          '/' +
          row['incomplete__all'],
      )}|${pad(
        row['verif_rate__6h'] +
          '%' +
          '/' +
          row['verif_rate__7d'] +
          '%' +
          '/' +
          row['verif_rate__all'] +
          '%',
      )}|${pad(
        row['pass_rate__6h'] +
          '%' +
          '/' +
          row['pass_rate__7d'] +
          '%' +
          '/' +
          row['pass_rate__all'] +
          '%',
      )}|${pad(
        row['fail_rate__6h'] +
          '%' +
          '/' +
          row['fail_rate__7d'] +
          '%' +
          '/' +
          row['fail_rate__all'] +
          '%',
      )}|${pad(
        row['incomplete_rate__6h'] +
          '%' +
          '/' +
          row['incomplete_rate__7d'] +
          '%' +
          '/' +
          row['incomplete_rate__all'] +
          '%',
      )}\``;
    }

    if (rows.length > 0) {
      const message = `:penguin-chill: *\`${pad('_  tenant   ')}|${pad(
        'total(6h/7d/all)',
      )}|${pad('pass')}|${pad('fail')}|${pad('incomplete')}|${pad(
        'verif_rate',
      )}|${pad('pass_rate')}|${pad('fail_rate')}|${pad('incomplete_rate')}\`*
${rows.map(r => row_to_string(r)).join('\n')}`;
      console.log('message', message);
      await airplane.slack.message('risk-alerts', message);
    }

    return rows;
  },
);
