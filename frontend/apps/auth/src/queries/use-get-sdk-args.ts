import { isTokenFormat } from '@onefootprint/core';
import request from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';

type Obj = Record<string, unknown>;
type GetSdkArgsResponse<T> = {
  args: { kind: string; data: T };
};

const getSdkArgs = async <T extends Obj>(authToken: string) => {
  const { data: response } = await request<GetSdkArgsResponse<T>>({
    method: 'GET',
    url: '/org/sdk_args',
    headers: { 'x-fp-sdk-args-token': authToken },
  });

  return response;
};

const useGetSdkArgs = <T extends Obj>(authToken: string) =>
  useQuery({
    queryKey: [authToken, 'get-sdk-args'],
    queryFn: () => getSdkArgs<T>(authToken),
    enabled: isTokenFormat(authToken),
  });

export default useGetSdkArgs;
