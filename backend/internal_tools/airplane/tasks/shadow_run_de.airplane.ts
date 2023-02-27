import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'shadow_run_de',
    name: 'Shadow Run Decision Engine',
    parameters: {
      fp_user_id: {
        name: 'fp_user_id',
        required: true,
        default: 'fp_id_123',
        type: 'shorttext',
      },
      tenant_id: {
        name: 'tenant_id',
        required: true,
        default: 'org_123',
        type: 'shorttext',
      },
    },
  },
  async params => {
    return await protected_custodian_api_call(
      'private/protected/risk/shadow_run_vendor_calls_and_decisioning',
      params,
    );
  },
);
