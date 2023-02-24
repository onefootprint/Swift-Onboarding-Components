import airplane from 'airplane';
import axios from 'axios';

export default airplane.task(
  {
    slug: 'shadow_run_de_cron',
    name: 'Cron Shadow Run Decision Engine',
    schedules: {
      every_four_hours: {
        cron: '0 */4 * * *',
        description: 'Runs every 4 hours',
      },
    },
  },
  async _ => {
    const TEST_CASES = [
      [
        {
          tenant_id: 'org_e2FHVfOM5Hd3Ce492o5Aat',
          fp_user_id: 'fp_id_BMKlGNSJP7BLTioi3GhI6l',
        },
        'pass',
      ],
      [
        {
          tenant_id: 'org_e2FHVfOM5Hd3Ce492o5Aat',
          fp_user_id: 'fp_id_Sympj5XJ6XmUq1VnEtA4pL',
        },
        'fail',
      ],
    ];

    for (const [params, expected_decision_status] of TEST_CASES) {
      const run = await airplane.execute<object>('shadow_run_de', {
        tenant_id: params['tenant_id'],
        fp_user_id: params['fp_user_id'],
      });
      const decision_status = run.output['decision_status'];
      if (decision_status != expected_decision_status) {
        throw `decision_status = ${decision_status}, expected = ${expected_decision_status}, params = ${JSON.stringify(
          params,
        )}`;
      }
    }
  },
);
