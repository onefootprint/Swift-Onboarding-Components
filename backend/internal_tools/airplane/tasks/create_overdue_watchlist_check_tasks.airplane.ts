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
    schedules:
      process.env.AIRPLANE_ENV_SLUG === 'prod'
        ? {
            every_day: {
              cron: '0 17 * * *',
              description: 'Runs once per day at 17:00 UTC',
              paramValues: { limit: 1000 },
            },
          }
        : {},
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
