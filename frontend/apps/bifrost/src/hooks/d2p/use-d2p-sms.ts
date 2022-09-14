import { useMutation } from '@tanstack/react-query';
import { BIOMETRIC_BASE_URL } from 'global-constants';
import request, { RequestError } from 'request';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';
import { D2PSmsRequest, D2PSmsResponse } from 'types';

const d2pSms = async (payload: D2PSmsRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/sms',
    data: {
      baseUrl: BIOMETRIC_BASE_URL,
    },
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useD2PSms = () =>
  useMutation<D2PSmsResponse, RequestError, D2PSmsRequest>(d2pSms);

export default useD2PSms;
