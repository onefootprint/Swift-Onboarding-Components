import request from '@onefootprint/request';
import type {
  SendSocureDeviceSessionIdRequest,
  SendSocureDeviceSessionIdResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const sendDeviceSessionIdRequest = async (
  data: SendSocureDeviceSessionIdRequest,
  authToken: string,
) => {
  const response = await request<SendSocureDeviceSessionIdResponse>({
    method: 'POST',
    url: '/hosted/onboarding/sds',
    data,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useSendDeviceSessionId = (authToken: string) =>
  useMutation({
    mutationFn: (data: SendSocureDeviceSessionIdRequest) =>
      sendDeviceSessionIdRequest(data, authToken),
  });

export default useSendDeviceSessionId;
