import request from '@onefootprint/request';
import type { D2PSmsRequest, D2PSmsResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

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

const useD2PSms = () => useMutation(d2pSms);

export default useD2PSms;
