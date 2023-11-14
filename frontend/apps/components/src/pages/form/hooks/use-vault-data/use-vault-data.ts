import { getErrorMessage } from '@onefootprint/request';
import type { DataIdentifier, UsersVaultRequest } from '@onefootprint/types';
import type { AxiosError } from 'axios';

import useUsersVault from './hooks/use-users-vault';

export type UsersVaultErrorMessage = Partial<Record<DataIdentifier, string>>;
export type UsersVaultError = {
  error: {
    message: string | UsersVaultErrorMessage | unknown;
  };
};

export type UsersVaultArgs = UsersVaultRequest & {
  onSuccess: () => void;
  onError: (errorMessage: string | UsersVaultErrorMessage) => void;
};

const useVaultData = () => {
  const usersVaultMutation = useUsersVault();

  const vaultData = ({
    authToken,
    data,
    onSuccess,
    onError,
  }: UsersVaultArgs) => {
    if (!authToken) {
      onError('Something went wrong! Please refresh the page and try again.');
      console.error('Found empty auth token while vaulting data.');
      return;
    }

    usersVaultMutation.mutate(
      {
        authToken,
        data,
      },
      {
        onSuccess,
        onError: (err: unknown) => {
          const fieldErrors = (err as AxiosError<UsersVaultError>)?.response
            ?.data.error.message;
          if (fieldErrors && typeof fieldErrors === 'object') {
            onError(fieldErrors);
          } else {
            const message = `Form encountered error while vaulting data ${getErrorMessage(
              err,
            )}`;
            console.error(message);
            onError(message);
          }
        },
      },
    );
  };

  return { vaultData, usersVaultMutation };
};

export default useVaultData;
