import request from '@onefootprint/request';
import type { BusinessRequest, BusinessResponse } from '@onefootprint/types';
import { KYB_BO_SESSION_AUTHORIZATION_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const getBusinessRequest = async ({ obConfigAuth }: BusinessRequest) => {
  const { data } = await request<BusinessResponse>({
    method: 'GET',
    url: '/hosted/business',
    headers: obConfigAuth,
  });

  return data;
};

const useGetBusiness = (
  payload: BusinessRequest,
  options: {
    onSuccess?: (data: BusinessResponse) => void;
    onError?: (error: unknown) => void;
  } = {},
) => {
  const query = useQuery({
    queryKey: ['get-business', payload],
    queryFn: () => getBusinessRequest(payload),
    enabled: !!payload?.obConfigAuth && KYB_BO_SESSION_AUTHORIZATION_HEADER in payload.obConfigAuth,
  });

  useEffect(() => {
    if (query.isSuccess) {
      options.onSuccess?.(query.data);
    }
    if (query.isError) {
      options.onError?.(query.error);
    }
  }, [query.isSuccess, query.isError, query.error, options.onSuccess, options.onError]);

  return query;
};

export default useGetBusiness;
