import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { EntityVault } from '@onefootprint/types';

import type { EditSubmitData } from '../../../../vault.types';
import { Event, State, useEditMachine } from '../../../edit-machine';
import useEditFields from './hooks/use-edit-fields';

const useEditControls = () => {
  const test = useEditMachine();
  const [state, send] = test;
  const { context } = state;
  const editFields = useEditFields();
  const showRequestErrorToast = useRequestErrorToast();
  const isIdle = state.matches(State.idle);
  const isLoading = state.matches(State.savingEdit);
  const inProgress =
    state.matches(State.editingFields) || state.matches(State.savingEdit);

  const start = () => {
    send(Event.started);
  };

  const cancel = () => {
    send(Event.canceled);
  };

  const submitFields = (fields: EditSubmitData) => {
    send(Event.submittedFields, { payload: { fields } });
  };

  const saveEdit = (
    entityId: string,
    vaultData: EditSubmitData,
    callbacks?: {
      onSuccess?: (response: EntityVault) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    const { dis = [] } = context;
    editFields(
      { entityId, vaultData },
      {
        onSuccess: () => {
          send(Event.editSucceeded);
          callbacks?.onSuccess?.(vaultData);
        },
        onError: (error: unknown) => {
          send(Event.editFailed);
          console.error(
            `Editing fields (${dis.join(', ')}) failed`,
            getErrorMessage(error),
          );
          showRequestErrorToast(error);
          callbacks?.onError?.(error);
        },
      },
    );
  };

  return {
    context,
    start,
    cancel,
    isIdle,
    isLoading,
    submitFields,
    inProgress,
    saveEdit,
  };
};

export default useEditControls;
