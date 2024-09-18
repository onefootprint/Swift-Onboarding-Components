import request from '@onefootprint/request';
import type { BusinessRequest, BusinessResponse } from '@onefootprint/types';
import { KYB_BO_SESSION_AUTHORIZATION_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

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
  useQuery(['get-business', payload], () => getBusinessRequest(payload), {
    enabled: !!payload?.obConfigAuth && KYB_BO_SESSION_AUTHORIZATION_HEADER in payload.obConfigAuth,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
};

export default useGetBusiness;
