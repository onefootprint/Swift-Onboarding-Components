import { getErrorMessage } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import React from 'react';
import useDecryptUser from 'src/pages/users/pages/user-details/hooks/use-descrypt-user';
import useUser from 'src/pages/users/pages/user-details/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import useUserVault from 'src/pages/users/pages/user-details/hooks/use-user-vault';
import getAttrListFromFields from 'src/utils/get-attr-list-from-fields';
import { useUpdateEffect } from 'usehooks-ts';

import { Event, State } from '../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../decrypt-machine-provider';
import DecryptVaultData from './components/decrypt-vault-data';
import ViewVaultData from './components/view-vault-data';

const VaultData = () => {
  const userId = useUserId();
  const userQuery = useUser(userId);
  const userVaultDataQuery = useUserVault(userId, userQuery.data);
  const decryptUser = useDecryptUser();
  const [state, send] = useDecryptMachine();
  const toast = useToast();
  const { fields, reason } = state.context;
  const showForm =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.decrypting);

  useUpdateEffect(() => {
    if (state.matches(State.decrypting) && reason && fields) {
      // Get the attribute names with true values
      const { kycData, idDoc } = getAttrListFromFields(
        fields.kycData,
        fields.idDoc,
      );
      decryptUser(
        { kycData, idDoc, reason },
        {
          onSuccess: () => {
            send({ type: Event.decryptSucceeded });
          },
          onError: (error: unknown) => {
            send({ type: Event.decryptFailed });
            toast.show({
              description: getErrorMessage(error),
              title: 'Uh-oh!',
              variant: 'error',
            });
          },
        },
      );
    }
  }, [state.value]);

  if (userVaultDataQuery.isLoading || userQuery.isLoading) {
    return null;
  }

  if (userVaultDataQuery.data && userQuery.data) {
    return showForm ? (
      <DecryptVaultData
        user={userQuery.data}
        vaultData={userVaultDataQuery.data}
      />
    ) : (
      <ViewVaultData vaultData={userVaultDataQuery.data} />
    );
  }

  return null;
};

export default VaultData;
