import airplane from 'airplane';

export default airplane.task(
  {
    slug: 'shadow_run_de_cron',
    name: 'Cron Shadow Run Decision Engine',
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            every_four_hours: {
              cron: '0 */4 * * *',
              description: 'Runs every 4 hours',
            },
          }
        : {},
  },
  async _ => {
    const TEST_CASES = [
      [
        {
          wf_id: 'wf_OmtQqCeYNbf94oYS3PNUZ',
          vendor_api: 'idology_expect_id',
        },
        'pass',
      ],
      [
        {
          wf_id: 'wf_AEhn9GSvpKqL1Uyt66QrBC',
          vendor_api: 'idology_expect_id',
        },
        'fail',
      ],
    ];

    class Run {
      params: object;
      error?: string;

      constructor(params, error) {
        this.params = params;
        this.error = error;
      }
    }

    let runs: Run[] = [];
    for (const [params, expected_decision_status] of TEST_CASES) {
      let error;
      try {
        const run = await airplane.execute<object>('shadow_run_de', params);

        const decision_status = run.output['decision_status'];
        if (decision_status != expected_decision_status) {
          error = `decision_status = ${decision_status}, expected = ${expected_decision_status}`;
        }
      } catch (e) {
        error = `${e}`;
      }
      runs.push(new Run(params, error));
    }

    let errors = runs.filter(r => r.error);
    if (errors.length > 0) {
      const message = `*Cron Shadow Run Decision Engine - Error(s)*\n  • ${errors
        .map(e => JSON.stringify(e))
        .join('\n  • ')}`;
      await airplane.slack.message('risk-alerts', message);
      throw message;
    }
    return runs;
  },
);
