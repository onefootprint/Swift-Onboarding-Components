import request from '@onefootprint/request';
import type { D2PSmsRequest, D2PSmsResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const d2pSms = async (payload: D2PSmsRequest) => {
  const response = await request<D2PSmsResponse>({
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

const useD2PSms = () => {
  return useMutation({
    mutationFn: d2pSms,
  });
};

export default useD2PSms;
