import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { UsersVaultRequest, UsersVaultResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../../config/constants';

const usersVaultRequest = async (payload: UsersVaultRequest) => {
  const { authToken, data } = payload;
  const response = await requestWithoutCaseConverter<UsersVaultResponse>({
    method: 'PATCH',
    url: '/users/vault',
    data,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useUsersVault = () => useMutation(usersVaultRequest);

export default useUsersVault;
