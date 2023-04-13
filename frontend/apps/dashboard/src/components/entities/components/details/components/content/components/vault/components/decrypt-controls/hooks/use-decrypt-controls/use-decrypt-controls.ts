import { useRequestErrorToast } from '@onefootprint/hooks';
import { EntityVault } from '@onefootprint/types';

import type { FormData } from '../../../../vault.types';
import { Event, State, useDecryptMachine } from '../../../decrypt-machine';
import useDecryptFields from './hooks/use-decrypt-fields';

const useDecryptControls = () => {
  const [state, send] = useDecryptMachine();
  const { context } = state;
  const decryptFields = useDecryptFields();
  const showRequestErrorToast = useRequestErrorToast();
  const isOpen =
    state.matches(State.confirmingReason) || state.matches(State.decrypting);
  const isIdle = state.matches(State.idle);
  const isLoading = state.matches(State.decrypting);
  const inProgress =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.decrypting);

  const start = () => {
    send(Event.started);
  };

  const cancel = () => {
    send(Event.canceled);
  };

  const submitFields = (fields: FormData) => {
    send(Event.submittedFields, { payload: { fields } });
  };

  const submitReason = (reason: string) => {
    send(Event.submittedReason, { payload: { reason } });
  };

  const decrypt = (
    userId: string,
    callbacks?: {
      onSuccess?: (response: EntityVault) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    const { reason, diFields } = context;
    decryptFields(
      { reason, diFields, userId },
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
    inProgress,
    decrypt,
  };
};

export default useDecryptControls;
