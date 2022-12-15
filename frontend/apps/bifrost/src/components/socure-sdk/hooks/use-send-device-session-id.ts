import request from '@onefootprint/request';
import {
  SocureDeviceSessionIdRequest,
  SocureDeviceSessionIdResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { AUTH_HEADER } from 'src/config/constants';

const sendDeviceSessionId = async ({
  authToken,
  ...data
}: SocureDeviceSessionIdRequest) => {
  const response = await request<SocureDeviceSessionIdResponse>({
    method: 'POST',
    url: '/hosted/onboarding/sds',
    data,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useSendDeviceSessionId = () => useMutation(sendDeviceSessionId);

export default useSendDeviceSessionId;
