import request from '@onefootprint/request';
import type { GetSdkArgsRequest, GetSdkArgsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

const isValidTokenFormat = (x: string): boolean => Boolean(x) && /tok_/.test(x);

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
    enabled: isValidTokenFormat(authToken),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

export default useSdkArgs;
