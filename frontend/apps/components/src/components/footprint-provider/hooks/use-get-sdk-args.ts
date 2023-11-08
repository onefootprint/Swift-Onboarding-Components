import request from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

type GetSdkArgsResponse<T> = {
  args: {
    kind: string;
    data: T;
  };
  obConfig?: PublicOnboardingConfig;
};

type Obj = Record<string, unknown>;

const getSdkArgs = async <T extends Obj>(authToken: string) => {
  const { data: response } = await request<GetSdkArgsResponse<T>>({
    method: 'GET',
    url: '/org/sdk_args',
    headers: {
      'x-fp-sdk-args-token': authToken,
    },
  });

  return response;
};

const useGetSdkArgs = <T extends Obj>(authToken: string) =>
  useQuery([authToken, 'get-sdk-args'], () => getSdkArgs<T>(authToken), {
    enabled: !!authToken,
  });

export default useGetSdkArgs;
