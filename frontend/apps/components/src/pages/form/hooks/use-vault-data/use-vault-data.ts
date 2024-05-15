import { LoggerDeprecated } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { DataIdentifier, UsersVaultRequest } from '@onefootprint/types';
import type { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.errors',
  });
  const usersVaultMutation = useUsersVault();

  const vaultData = ({
    authToken,
    data,
    onSuccess,
    onError,
  }: UsersVaultArgs) => {
    if (!authToken) {
      onError(t('missing-auth-token'));
      LoggerDeprecated.error('Found empty auth token while vaulting data.');
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
            LoggerDeprecated.error(
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
