import { isTokenFormat } from '@onefootprint/core';
import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import type { ProviderReturn } from '@onefootprint/idv';
import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import getSdkContext from '../../../../utils/sdk-context';

type GetSdkArgsResponse = {
  args: { kind: string; data: FootprintVerifyDataProps };
};

const getSdkArgs = async (authToken: string, fpProvider: ProviderReturn) => {
  const sdkContextModel = await getSdkContext(fpProvider);
  const { data: response } = await request<GetSdkArgsResponse>({
    method: 'GET',
    url: '/org/sdk_args',
    headers: sdkContextModel
      ? {
          'x-fp-client-version': `footprint-js ${sdkContextModel.sdkVersion} ${sdkContextModel.sdkUrl}`.trim(),
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
) => {
  const query = useQuery({
    queryKey: ['get-sdk-args', authToken],
    queryFn: () => getSdkArgs(authToken, fpProvider),
    enabled: isTokenFormat(authToken),
  });

  useEffect(() => {
    if (query.isSuccess && options?.onSuccess) {
      options.onSuccess(query.data);
    }
    if (query.isError && options?.onError) {
      options.onError(query.error as RequestError);
    }
    // don't pass options?.isSUccess and options?.onError - triggers infinite loop
  }, [query.isSuccess, query.isError, query.data, query.error]);

  return query;
};

export default useGetSdkArgs;
