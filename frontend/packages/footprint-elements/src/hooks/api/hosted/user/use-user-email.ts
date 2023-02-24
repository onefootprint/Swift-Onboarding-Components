import { requestWithoutCaseConverter } from '@onefootprint/request';
import { UserEmailRequest, UserEmailResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../config/constants';

const userEmailRequest = async (payload: UserEmailRequest) => {
  let method;
  let url;
  if (payload.speculative) {
    method = 'POST';
    url = '/hosted/user/vault/validate';
  } else {
    method = 'PUT';
    url = '/hosted/user/vault';
  }
  const response = await requestWithoutCaseConverter<UserEmailResponse>({
    method,
    url,
    data: {
      'id.email': payload.data.email,
    },
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserEmail = () => useMutation(userEmailRequest);

export default useUserEmail;
