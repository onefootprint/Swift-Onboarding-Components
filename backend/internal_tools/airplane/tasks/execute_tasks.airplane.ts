import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'execute_tasks',
    name: 'Executes a specified number of tasks',
    parameters: {
      num_tasks: {
        name: 'num_tasks',
        required: true,
        default: 0,
        type: 'integer',
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
      'private/protected/task/execute_tasks',
      params,
    );
  },
);
