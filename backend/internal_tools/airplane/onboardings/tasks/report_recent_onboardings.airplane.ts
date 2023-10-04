import airplane from 'airplane';

export default airplane.task(
  {
    slug: 'report_recent_onboardings',
    name: 'Report Recent Onboardings',
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
    });
    let rows = (run.output as object)['Q1'];

    if (rows.length > 0) {
      let cols = [
        // 'completed_at',
        'tenant_name',
        // 'tenant_id',
        'fp_id',
        'status',
        'assume',
        'user_dash',
        'inc_link',
        'bad_rs',
        'latest_failure_reasons',
        'document_type',
      ];

      function fieldString(col, value) {
        if (value === null) {
          return '';
        }
        if (col === 'assume') {
          return `(<${value}|assume>)`;
        } else if (col === 'user_dash') {
          return `(<${value}|user_dash>)`;
        } else if (col === 'inc_link') {
          return `(<${value}|inc_link>)`;
        } else if (col === 'bad_rs' || col === 'latest_failure_reasons') {
          return `[${value}]`;
        } else if (col === 'status') {
          return `*${value}*`;
        } else {
          return `${value}`;
        }
      }

      const message = `* ${
        rows.length
      } Onboardings in past 5min* (showing first 30)\n${cols
        .map(c => `${c}`)
        .join(' | ')}\n${rows
        .slice(0, 30) // only show first 30 so we don't barf too hard on Slack
        .map(e => cols.map(c => fieldString(c, e[c])).join(' | '))
        .join('\n')}`;

      await airplane.slack.message('risk-alerts', message);
    }

    return rows;
  },
);
