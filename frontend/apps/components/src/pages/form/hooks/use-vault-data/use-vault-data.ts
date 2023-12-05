import { useTranslation } from '@onefootprint/hooks';
import { Logger } from '@onefootprint/idv-elements';
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
  const { t } = useTranslation('pages.secure-form.errors');
  const usersVaultMutation = useUsersVault();

  const vaultData = ({
    authToken,
    data,
    onSuccess,
    onError,
  }: UsersVaultArgs) => {
    if (!authToken) {
      onError(t('missing-auth-token'));
      Logger.error('Found empty auth token while vaulting data.');
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
            const errorMessage = getErrorMessage(err);
            Logger.error(
              `Form encountered error while vaulting data: ${errorMessage}`,
            );
            onError(errorMessage);
          }
        },
      },
    );
  };

  return { vaultData, usersVaultMutation };
};

export default useVaultData;
