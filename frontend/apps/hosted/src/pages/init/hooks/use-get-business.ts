import request from '@onefootprint/request';
import { BusinessRequest, BusinessResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { KYB_BO_SESSION_AUTHORIZATION_HEADER } from 'src/config/constants';

const getBusinessRequest = async ({ authToken }: BusinessRequest) => {
  const { data } = await request<BusinessResponse>({
    method: 'GET',
    url: '/hosted/business',
    headers: {
      [KYB_BO_SESSION_AUTHORIZATION_HEADER]: authToken,
    },
  });

  return data;
};

const useGetBusiness = (
  authToken: string,
  options: {
    onSuccess?: (data: BusinessResponse) => void;
    onError?: (error: unknown) => void;
  } = {},
) => {
  useQuery(
    ['get-business', authToken],
    () => getBusinessRequest({ authToken }),
    {
      enabled: !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetBusiness;
