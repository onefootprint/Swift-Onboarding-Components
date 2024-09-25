import { isTokenFormat } from '@onefootprint/core';
import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

type GetSdkArgsResponse = {
  args: { kind: string; data: FootprintVerifyDataProps };
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
) => {
  const query = useQuery({
    queryKey: ['get-sdk-args', authToken],
    queryFn: () => getSdkArgs(authToken),
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
