import request, { RequestError } from '@onefootprint/request';
import {
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { ONBOARDING_CONFIG_KEY_HEADER } from '../../../config/constants';

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data: payload,
    headers: {
      [ONBOARDING_CONFIG_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useIdentifyVerify = () =>
  useMutation<IdentifyVerifyResponse, RequestError, IdentifyVerifyRequest>(
    identifyVerifyRequest,
  );

export default useIdentifyVerify;
