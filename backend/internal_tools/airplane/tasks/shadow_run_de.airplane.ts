import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'shadow_run_de',
    name: 'Shadow Run Decision Engine',
    parameters: {
      wf_id: {
        name: 'wf_id',
        required: true,
        default: 'wf_id_123',
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
      'private/protected/risk/shadow_run_vendor_calls_and_decisioning',
      params,
    );
  },
);
