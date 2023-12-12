import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import type { ProviderReturn } from '@onefootprint/idv-elements';
import { isValidTokenFormat } from '@onefootprint/idv-elements';
import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

type GetSdkArgsResponse = {
  args: { kind: string; data: FootprintVerifyDataProps };
  obConfig?: PublicOnboardingConfig;
};

const extractCleanDomain = (s: string): string =>
  s.replace(/(https?:\/\/)?(www\.)?/gi, '').split('/')[0];

const getSdkArgs = async (authToken: string, fpProvider: ProviderReturn) => {
  let sdkUrl = '';
  let sdkVersion = '';
  try {
    const childApiRef = await fpProvider.load();
    sdkUrl = childApiRef?.model?.sdkUrl || '';
    sdkVersion = childApiRef?.model?.sdkVersion || '';
  } catch {
    /* empty */
  }
  const { data: response } = await request<GetSdkArgsResponse>({
    method: 'GET',
    url: '/org/sdk_args',
    headers: sdkVersion
      ? {
          'x-fp-client-version':
            `footprint-js ${sdkVersion} ${extractCleanDomain(sdkUrl)}`.trim(),
          'x-fp-sdk-args-token': authToken,
        }
      : { 'x-fp-sdk-args-token': authToken },
  });

  return response;
};

const useGetSdkArgs = (
  authToken: string,
  fpProvider: ProviderReturn,
  options?: {
    onSuccess: (data: GetSdkArgsResponse) => void;
    onError: (error: RequestError) => void;
  },
) =>
  useQuery(
    [authToken, 'get-sdk-args'],
    () => getSdkArgs(authToken, fpProvider),
    {
      enabled: isValidTokenFormat(authToken),
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    },
  );

export default useGetSdkArgs;
