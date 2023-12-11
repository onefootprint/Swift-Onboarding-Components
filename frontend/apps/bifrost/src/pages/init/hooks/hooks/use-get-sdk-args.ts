import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import { isValidTokenFormat } from '@onefootprint/idv-elements';
import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

type GetSdkArgsResponse = {
  args: {
    kind: string;
    data: FootprintVerifyDataProps;
  };
  obConfig?: PublicOnboardingConfig;
};

const getSdkArgs = async (authToken: string) => {
  const { data: response } = await request<GetSdkArgsResponse>({
    method: 'GET',
    url: '/org/sdk_args',
    headers: { 'x-fp-sdk-args-token': authToken },
  });

  return response;
};

const useGetSdkArgs = (
  authToken: string,
  options?: {
    onSuccess: (data: GetSdkArgsResponse) => void;
    onError: (error: RequestError) => void;
  },
) =>
  useQuery([authToken, 'get-sdk-args'], () => getSdkArgs(authToken), {
    enabled: isValidTokenFormat(authToken),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

export default useGetSdkArgs;
