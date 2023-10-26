import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'create_overdue_watchlist_check_tasks',
    name: 'Creates watchlist check tasks for overdue vaults',
    parameters: {
      limit: {
        name: 'limit',
        required: true,
        default: 0,
        type: 'integer',
      },
    },
    envVars: {
      FPC_PRIVATE_PROECTED_TOKEN: { config: 'FPC_PRIVATE_PROECTED_TOKEN' },
      API_URL: { config: 'API_URL' },
    },
    // Turning off schedule for now so I can manually slow rollout and test new logic
    // schedules:
    //   process.env.AIRPLANE_ENV_SLUG === 'prod'
    //     ? {
    //         every_day: {
    //           cron: '0 17 * * *',
    //           description: 'Runs once per day at 17:00 UTC',
    //           paramValues: { tenant_id: 'org_PtnIJT4VR35BS9xy0wITgF' },
    //         },
    //       }
    //     : {},
  },
  async params => {
    return await protected_custodian_api_call(
      process.env.FPC_PRIVATE_PROECTED_TOKEN,
      process.env.API_URL,
      'private/protected/task/create_overdue_watchlist_check_tasks',
      params,
    );
  },
);
