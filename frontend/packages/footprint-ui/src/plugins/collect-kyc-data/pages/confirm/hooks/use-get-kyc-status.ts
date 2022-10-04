import request, { RequestError } from '@onefootprint/request';
import { GetKycStatusRequest, GetKycStatusResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { useCollectKycDataMachine } from '../../../components/machine-provider';
import {
  BIFROST_AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from '../../../config/contants';

const KYC_STATUS_FETCH_INTERVAL = 1000;

const getKycStatus = async (payload: GetKycStatusRequest) => {
  const response = await request<GetKycStatusResponse>({
    method: 'GET',
    url: '/hosted/onboarding/kyc',
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useGetKycStatus = (
  options: {
    onSuccess?: (data: GetKycStatusResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const [state] = useCollectKycDataMachine();
  const { authToken, tenant, kycPending } = state.context;

  return useQuery<GetKycStatusResponse, RequestError>(
    ['kyc-status', authToken, tenant?.pk],
    () =>
      getKycStatus({ authToken: authToken ?? '', tenantPk: tenant?.pk ?? '' }),
    {
      refetchInterval: KYC_STATUS_FETCH_INTERVAL,
      enabled: !!kycPending && !!authToken && !!tenant?.pk,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetKycStatus;
