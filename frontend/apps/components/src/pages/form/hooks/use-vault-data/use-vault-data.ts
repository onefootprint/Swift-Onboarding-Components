import { getLogger } from '@onefootprint/idv';
import { getErrorMessage, useRequestError } from '@onefootprint/request';
import type { DataIdentifier, UsersVaultRequest } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

import useUsersVault from './hooks/use-users-vault';

export type UsersVaultErrorMessage = Partial<Record<DataIdentifier, string>>;

export type UsersVaultArgs = UsersVaultRequest & {
  onSuccess: () => void;
  onError: (errorMessage: string | UsersVaultErrorMessage) => void;
};

const { logError } = getLogger({ location: 'use-vault-data' });

const useVaultData = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.errors',
  });
  const usersVaultMutation = useUsersVault();
  const { getErrorCode, getErrorContext } = useRequestError();

  const vaultData = ({ authToken, data, onSuccess, onError }: UsersVaultArgs) => {
    if (!authToken) {
      onError(t('missing-auth-token'));
      logError('Found empty auth token while vaulting data.');
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
          const isVaultDataValidationError = getErrorCode(err) === 'T120';
          const context = getErrorContext(err);
          if (context && typeof context === 'object' && isVaultDataValidationError) {
            onError(context);
          } else {
            const errorMessage = getErrorMessage(err);
            logError(`Form encountered error while vaulting data: ${errorMessage}`, err);
            onError(errorMessage);
          }
        },
      },
    );
  };

  return { vaultData, usersVaultMutation };
};

export default useVaultData;
