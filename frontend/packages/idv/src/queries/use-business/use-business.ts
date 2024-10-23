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
const useBusiness = (payload: BusinessRequest) => {
  const query = useQuery({
    queryKey: ['get-business', payload],
    queryFn: () => getBusinessRequest(payload),
    enabled: !!payload?.obConfigAuth && KYB_BO_SESSION_AUTHORIZATION_HEADER in payload.obConfigAuth,
  });

  return query;
};

export default useBusiness;
