import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'create_overdue_watchlist_check_tasks',
    name: 'Creates watchlist check tasks for overdue vaults on a tenant',
    parameters: {
      tenant_id: {
        name: 'tenant_id',
        required: true,
        default: 'org_123abc',
        type: 'shorttext',
      },
    },
    envVars: {
      FPC_PRIVATE_PROECTED_TOKEN: { config: 'FPC_PRIVATE_PROECTED_TOKEN' },
      API_URL: { config: 'API_URL' },
    },
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
