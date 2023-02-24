import airplane from 'airplane';
import axios from 'axios';

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
        default: 'fp_id_123',
        type: 'shorttext',
      },
    },
    envVars: {
      FPC_PRIVATE_PROECTED_TOKEN: { config: 'FPC_PRIVATE_PROECTED_TOKEN' },
      API_URL: { config: 'API_URL' },
    },
  },
  async params => {
    const authToken = process.env.FPC_PRIVATE_PROECTED_TOKEN;
    const apiUrl = process.env.API_URL;

    try {
      const { data } = await axios.post(
        `${apiUrl}/private/protected/risk/shadow_run_vendor_calls_and_decisioning`,
        params,
        {
          headers: {
            'X-Fp-Protected-Custodian-Key': authToken,
          },
        },
      );

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw `Failed with status ${error.response?.status}: ${JSON.stringify(
          error.response?.data,
        )}`;
      } else {
        throw error;
      }
    }
  },
);
