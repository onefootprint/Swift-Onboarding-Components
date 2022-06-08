import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { D2P_BASE_URL } from 'src/constants';

export type D2PSmsRequest = {
  authToken: string; // scoped auth token generated by d2p
};

const d2pSms = async (payload: D2PSmsRequest) => {
  const { data: response } = await request<RequestResponse<{}>>({
    method: 'POST',
    url: '/onboarding/d2p/sms',
    data: {
      baseUrl: D2P_BASE_URL,
    },
    headers: {
      'X-Fpuser-Authorization': payload.authToken,
    },
  });
  return response.data;
};

const useD2PSms = () => useMutation<{}, RequestError, D2PSmsRequest>(d2pSms);

export default useD2PSms;
