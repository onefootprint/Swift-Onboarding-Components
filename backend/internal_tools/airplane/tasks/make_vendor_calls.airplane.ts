import airplane from 'airplane';
import { protected_custodian_api_call } from '../utils';

export default airplane.task(
  {
    slug: 'make_vendor_calls',
    name: 'Creates new VerificationRequests, re-pings all vendors, and writes VerificationResults for the passed in fp_id',
    parameters: {
      wf_id: {
        name: 'wf_id',
        required: true,
        default: 'wf_id_123',
        type: 'shorttext',
      },
      vendor_api: {
        name: 'vendor_api',
        required: true,
        type: 'shorttext',
        default: 'idology_expect_id',
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
      'private/protected/risk/make_vendor_calls',
      params,
    );
  },
);
