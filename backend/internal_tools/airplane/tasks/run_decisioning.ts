import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'run_decisioning',
    name: 'Runs decisioning logic on latest completed vendor requests and writes a new onboarding decision',
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
      'private/protected/risk/make_decision',
      params,
    );
  },
);
