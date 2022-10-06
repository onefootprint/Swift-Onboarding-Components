import request, { RequestError } from '@onefootprint/request';
import { StartKycRequest, StartKycResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import {
  AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from '../../../config/contants';

const startKyc = async (payload: StartKycRequest) => {
  const response = await request<StartKycResponse>({
    method: 'POST',
    url: '/hosted/onboarding/kyc',
    headers: {
      [AUTH_HEADER]: payload.authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useStartKyc = () =>
  useMutation<StartKycResponse, RequestError, StartKycRequest>(startKyc);

export default useStartKyc;
