import { getErrorMessage } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import React from 'react';
import useUser from 'src/hooks/use-user';
import getAttrListFromFields from 'src/utils/get-attr-list-from-fields';
import { useUpdateEffect } from 'usehooks-ts';

import useUserId from '../../../../hooks/use-user-id';
import { Event, State } from '../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../decrypt-machine-provider';
import { DecryptVaultData, ViewVaultData } from './components';

const VaultData = () => {
  const userId = useUserId();
  const { decrypt } = useUser(userId);
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
      decrypt(
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

  return showForm ? <DecryptVaultData /> : <ViewVaultData />;
};

export default VaultData;
