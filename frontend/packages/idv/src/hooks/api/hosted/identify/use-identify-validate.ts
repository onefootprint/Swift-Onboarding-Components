import request from '@onefootprint/request';
import { AUTH_HEADER } from '@onefootprint/types';
import type { IdentifyValidateRequest, IdentifyValidateResponse } from '@onefootprint/types/src/api/identify-validate';
import { useMutation } from '@tanstack/react-query';

const identifyValidateRequest = async (payload: IdentifyValidateRequest) => {
  const response = await request<IdentifyValidateResponse>({
    method: 'POST',
    url: '/hosted/identify/validation_token',
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response.data;
};

const useIdentifyValidate = () => useMutation(identifyValidateRequest);

export default useIdentifyValidate;
