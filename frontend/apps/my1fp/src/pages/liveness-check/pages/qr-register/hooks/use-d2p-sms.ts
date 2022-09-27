import { HANDOFF_BASE_URL } from '@onefootprint/global-constants';
import { D2PSmsRequest, D2PSmsResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';

const d2pSms = async (payload: D2PSmsRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/sms',
    data: {
      baseUrl: HANDOFF_BASE_URL,
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
