import request from '@onefootprint/request';
import { D2PSmsRequest } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { AUTH_HEADER } from 'src/config/constants';

const d2pSms = async (payload: D2PSmsRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/sms',
    data: {
      url: payload.url,
    },
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useD2PSms = () => useMutation(d2pSms);

export default useD2PSms;
