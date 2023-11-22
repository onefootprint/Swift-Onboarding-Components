import request from '@onefootprint/request';
import type {
  GetSdkArgsRequest,
  GetSdkArgsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

const getSdkArgs = async ({ authToken }: GetSdkArgsRequest) => {
  const { data: response } = await request<GetSdkArgsResponse>({
    url: '/org/sdk_args',
    headers: {
      'x-fp-sdk-args-token': authToken,
    },
  });

  return response;
};

const useSdkArgs = (
  authToken: string,
  options?: {
    onSuccess: (data: GetSdkArgsResponse) => void;
    onError: (error: unknown) => void;
  },
) =>
  useQuery([authToken, 'get-sdk-args'], () => getSdkArgs({ authToken }), {
    enabled: !!authToken,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

export default useSdkArgs;
