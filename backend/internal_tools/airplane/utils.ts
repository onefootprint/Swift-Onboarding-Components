import axios from 'axios';
import { Client } from 'pg';

export async function protected_custodian_api_call(
  authToken,
  apiUrl,
  path,
  params,
) {
  try {
    const { data } = await axios.post(`${apiUrl}/${path}`, params, {
      headers: {
        'X-Fp-Protected-Custodian-Key': authToken,
      },
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw `Failed with status ${error.response?.status}: ${error.response?.statusText}`;
    } else {
      throw error;
    }
  }
}

export async function pg_query(dbUrl, query) {
  // TODO: pooling in future
  const client = new Client({
    connectionString: dbUrl,
  });
  await client.connect();
  const res = await client.query(query);
  await client.end();

  return res.rows;
}
