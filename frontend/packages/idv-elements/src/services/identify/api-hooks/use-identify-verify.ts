import request from '@onefootprint/request';
import {
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { ONBOARDING_CONFIG_KEY_HEADER } from '../../../config/constants';

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const { customAuthHeader, tenantPk } = payload;
  const headers =
    customAuthHeader ??
    (tenantPk ? { [ONBOARDING_CONFIG_KEY_HEADER]: tenantPk } : {});

  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data: payload,
    headers,
  });

  return response.data;
};

const useIdentifyVerify = () => useMutation(identifyVerifyRequest);

export default useIdentifyVerify;
