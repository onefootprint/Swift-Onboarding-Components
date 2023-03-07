import axios from 'axios';

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
      throw `Failed with status ${error.response?.status}: ${JSON.stringify(
        error.response,
      )}`;
    } else {
      throw error;
    }
  }
}
