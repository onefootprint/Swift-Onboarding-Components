import request from '@onefootprint/request';
import type { SendSdkArgsRequest, SendSdkArgsResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const createSdkArgs = async (data: SendSdkArgsRequest) => {
  const response = await request<SendSdkArgsResponse>({
    method: 'POST',
    url: '/org/sdk_args',
    headers: {
      'x-fp-client-version': 'footprint-mobile 1',
    },
    data,
  });
  return response.data;
};

const useCreateSdkArgs = () => useMutation(createSdkArgs);

export default useCreateSdkArgs;
