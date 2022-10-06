import request, { RequestError } from '@onefootprint/request';
import { D2PSmsRequest, D2PSmsResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';

const d2pSms = async (payload: D2PSmsRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/sms',
    data: {
      url: payload.url,
    },
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useD2PSms = () =>
  useMutation<D2PSmsResponse, RequestError, D2PSmsRequest>(d2pSms);

export default useD2PSms;
