import { useRequestErrorToast } from '@onefootprint/hooks';
import type {
  DataIdentifier,
  EntityVault,
  VaultValue,
} from '@onefootprint/types';

import {
  Event,
  State,
  useDecryptMachine,
} from '../../../../../decrypt-machine';
import type { DecryptFormData } from '../../../../vault.types';
import useDecryptFields from './hooks/use-decrypt-fields';

const useDecryptControls = () => {
  const [state, send] = useDecryptMachine();
  const { context } = state;
  const decryptFields = useDecryptFields();
  const showRequestErrorToast = useRequestErrorToast();
  const isOpen =
    state.matches(State.confirmingReason) ||
    state.matches(State.confirmingDecryptAllReason) ||
    state.matches(State.decrypting) ||
    state.matches(State.decryptingAll);
  const isIdle = state.matches(State.idle);
  const isLoading =
    state.matches(State.decrypting) || state.matches(State.decryptingAll);
  const inProgress =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.confirmingDecryptAllReason) ||
    state.matches(State.decrypting) ||
    state.matches(State.decryptingAll);
  const inProgressDecryptingAll =
    state.matches(State.confirmingDecryptAllReason) ||
    state.matches(State.decryptingAll);

  const start = () => {
    send(Event.started);
  };

  const cancel = () => {
    send(Event.canceled);
  };

  const submitFields = (fields: DecryptFormData) => {
    send(Event.submittedFields, { payload: { fields } });
  };

  const submitAllFields = (fields: DataIdentifier[]) => {
    send(Event.submittedAllFields, { payload: { fields } });
  };

  const submitReason = (reason: string) => {
    send(Event.submittedReason, { payload: { reason } });
  };

  const decrypt = (
    entityId: string,
    vaultData?: Partial<Record<DataIdentifier, VaultValue>>,
    callbacks?: {
      onSuccess?: (response: EntityVault) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    const { reason, dis = [] } = context;
    decryptFields(
      { reason, dis, entityId, vaultData },
      {
        onSuccess: results => {
          send(Event.decryptSucceeded);
          callbacks?.onSuccess?.(results);
        },
        onError: (error: unknown) => {
          send(Event.decryptFailed);
          showRequestErrorToast(error);
          callbacks?.onError?.(error);
        },
      },
    );
  };

  return {
    submitReason,
    context,
    start,
    cancel,
    isOpen,
    isIdle,
    isLoading,
    submitFields,
    submitAllFields,
    inProgress,
    inProgressDecryptingAll,
    decrypt,
  };
};

export default useDecryptControls;
