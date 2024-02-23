import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

type SendResultSdkArgsRequest = {
  authToken: string;
  deviceResponse: string;
};

type SendResultSdkArgsResponse = {
  token: string;
  expiresAt: string;
};

const sendResultSdkArgs = async (payload: SendResultSdkArgsRequest) => {
  const { data: response } = await request<SendResultSdkArgsResponse>({
    method: 'POST',
    url: '/org/sdk_args',
    data: {
      kind: 'verify_result_v1',
      data: payload,
    },
  });

  return response?.token;
};

const useSendResultSdkArgs = () => useMutation(sendResultSdkArgs);

export default useSendResultSdkArgs;
