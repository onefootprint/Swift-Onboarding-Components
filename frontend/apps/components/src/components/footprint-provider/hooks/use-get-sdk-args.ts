import { isValidTokenFormat } from '@onefootprint/idv';
import request from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import type { ProviderReturn } from '../types';

type Obj = Record<string, unknown>;
type GetSdkArgsResponse<T> = {
  args: { kind: string; data: T };
  obConfig?: PublicOnboardingConfig;
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
  useQuery([authToken, 'get-sdk-args'], () => getSdkArgs<T>(authToken, fpProvider), {
    enabled: isValidTokenFormat(authToken),
  });

export default useGetSdkArgs;
