import airplane from 'airplane';
import axios from 'axios';

export default airplane.task(
  {
    slug: 'generate_invoices',
    name: 'Generate invoices (cron)',
    schedules: {
      every_hour: {
        // every 1 hour, for now
        cron: '0 */1 * * *',
      },
    },
    envVars: {
      FPC_PRIVATE_PROECTED_TOKEN: { config: 'FPC_PRIVATE_PROECTED_TOKEN' },
      API_URL: { config: 'API_URL' },
    },
  },
  async () => {
    const authToken = process.env.FPC_PRIVATE_PROECTED_TOKEN;
    const apiUrl = process.env.API_URL;

    const { data } = await axios
      .post(`${apiUrl}/private/invoices`, {
        headers: {
          'X-Fp-Protected-Custodian-Key': authToken,
        },
        validateStatus: statusCode => statusCode < 300,
      })
      .catch(e => {
        if (axios.isAxiosError(e)) {
          throw `Failed with status ${e.response?.status}: ${JSON.stringify(
            e.response?.data,
          )}`;
        } else {
          throw e;
        }
      });

    return data;
  },
);
