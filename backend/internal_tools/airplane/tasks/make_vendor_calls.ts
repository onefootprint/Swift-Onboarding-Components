import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'make_vendor_calls',
    name: 'Creates new VerificationRequests, re-pings all vendors, and writes VerificationResults for the passed in fp_user_id',
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
      'private/protected/risk/make_vendor_calls',
      params,
    );
  },
);
