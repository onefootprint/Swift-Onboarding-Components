import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'create_task',
    name: 'Enqueues a new Task',
    parameters: {
      task_data: {
        name: 'task_data',
        required: true,
        default: '{}',
        type: 'longtext',
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
      'private/protected/task/create_task',
      JSON.parse(params.task_data),
    );
  },
);
