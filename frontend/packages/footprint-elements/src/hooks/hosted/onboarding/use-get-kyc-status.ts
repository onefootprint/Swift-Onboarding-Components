import request, { RequestError } from '@onefootprint/request';
import { GetKycStatusRequest, GetKycStatusResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import {
  AUTH_HEADER,
  ONBOARDING_CONFIG_KEY_HEADER,
} from '../../../config/constants';

const KYC_STATUS_FETCH_INTERVAL = 1000;

const getKycStatus = async (payload: GetKycStatusRequest) => {
  const response = await request<GetKycStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/kyc',
    headers: {
      [AUTH_HEADER]: payload.authToken,
      [ONBOARDING_CONFIG_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useGetKycStatus = (
  enabled: boolean,
  authToken: string,
  tenantPk: string,
  options: {
    onSuccess?: (data: GetKycStatusResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) =>
  useQuery<GetKycStatusResponse, RequestError>(
    ['kyc-status', authToken, tenantPk],
    () =>
      getKycStatus({
        authToken,
        tenantPk,
      }),
    {
      refetchInterval: KYC_STATUS_FETCH_INTERVAL,
      enabled: enabled && !!authToken && !!tenantPk,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );

export default useGetKycStatus;
