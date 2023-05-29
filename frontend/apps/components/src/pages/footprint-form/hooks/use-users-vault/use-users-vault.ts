import { requestWithoutCaseConverter } from '@onefootprint/request';
import { UsersVaultRequest, UsersVaultResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { AUTH_HEADER } from 'src/config/constants';

const usersVaultRequest = async (payload: UsersVaultRequest) => {
  const { authToken, cardName, data } = payload;
  // Replace the * in data keys to embed the cardName in the key
  const editedData = Object.entries(data).reduce((acc, entry) => {
    const [key, value] = entry;
    const newKey = key.replace('*', cardName);
    return {
      ...acc,
      [newKey]: value,
    };
  }, {});

  const response = await requestWithoutCaseConverter<UsersVaultResponse>({
    method: 'PATCH',
    url: 'users/vault',
    data: editedData,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useUsersVault = () => useMutation(usersVaultRequest);

export default useUsersVault;
