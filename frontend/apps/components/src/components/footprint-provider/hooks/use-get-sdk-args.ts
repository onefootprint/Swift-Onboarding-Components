import { isTokenFormat } from '@onefootprint/core';
import request from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';

import type { ProviderReturn } from '../types';

type Obj = Record<string, unknown>;
type GetSdkArgsResponse<T> = {
  args: { kind: string; data: T };
};

const getSdkArgs = async <T extends Obj>(authToken: string, fpProvider: ProviderReturn) => {
  let sdkVersion = '';
  let sdkUrl = '';
  try {
    const childApiRef = await fpProvider.load();
    sdkVersion = childApiRef?.model?.sdkVersion || '';
    sdkUrl = childApiRef?.model?.sdkUrl || '';
  } catch {
    /* empty */
  }

  const { data: response } = await request<GetSdkArgsResponse<T>>({
    method: 'GET',
    url: '/org/sdk_args',
    headers: sdkVersion
      ? {
          'x-fp-client-version': `footprint-js ${sdkVersion} ${sdkUrl}`.trim(),
          'x-fp-sdk-args-token': authToken,
        }
      : { 'x-fp-sdk-args-token': authToken },
  });

  return response;
};

const useGetSdkArgs = <T extends Obj>(authToken: string, fpProvider: ProviderReturn) =>
  useQuery({
    queryKey: [authToken, 'get-sdk-args'],
    queryFn: () => getSdkArgs<T>(authToken, fpProvider),
    enabled: isTokenFormat(authToken),
  });

export default useGetSdkArgs;
