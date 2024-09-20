import { isTokenFormat } from '@onefootprint/core';
import request from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import type { ProviderReturn } from '../provider-footprint/types';

type Obj = Record<string, unknown>;
type GetSdkArgsResponse<T> = {
  args: { kind: string; data: T };
  obConfig?: PublicOnboardingConfig;
};

const getSdkArgs = async <T extends Obj>(authToken: string, fpProvider: ProviderReturn) => {
  let optionalSdkUrl = '';
  let optionalSdkVersion = '';
  try {
    const fpModel = await fpProvider.load();
    optionalSdkUrl = fpModel?.model?.sdkUrl || '';
    optionalSdkVersion = fpModel?.model?.sdkVersion || '';
  } catch {
    /* empty */
  }

  const { data: response } = await request<GetSdkArgsResponse<T>>({
    method: 'GET',
    url: '/org/sdk_args',
    headers: optionalSdkVersion
      ? {
          'x-fp-client-version': `footprint-js ${optionalSdkVersion} ${optionalSdkUrl}`.trim(),
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
