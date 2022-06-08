import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type D2PSmsRequest = {
  authToken: string; // scoped auth token generated by d2p
};

const BASE_URL = 'biometric.footprint.dev'; // TODO: add this base url

const d2pSms = async (payload: D2PSmsRequest) => {
  const { data: response } = await request<RequestResponse<{}>>({
    method: 'POST',
    url: '/onboarding/d2p/sms',
    data: {
      // User will be sent an SMS with the link ${BASE_URL}/#${auth_token}
      baseUrl: BASE_URL,
    },
    headers: {
      'X-Fpuser-Authorization': payload.authToken,
    },
  });
  return response.data;
};

const useD2PSms = () => useMutation<{}, RequestError, D2PSmsRequest>(d2pSms);

export default useD2PSms;
