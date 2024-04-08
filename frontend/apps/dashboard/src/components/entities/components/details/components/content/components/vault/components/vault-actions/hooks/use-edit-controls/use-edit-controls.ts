import { getErrorMessage } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import type { VaultType } from 'src/components/entities/hooks/use-entity-vault-with-transforms';

import type { EditSubmitData } from '../../../../vault.types';
import { Event, State, useEditMachine } from '../../../edit-machine';
import useEditFields from './hooks/use-edit-fields';

const useEditControls = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.edit' });
  const [state, send] = useEditMachine();
  const { context } = state;
  const editFields = useEditFields();
  const toast = useToast();
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
      onSuccess?: (response: VaultType) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    editFields(
      { entityId, vaultData },
      {
        onSuccess: () => {
          send(Event.editSucceeded);
          callbacks?.onSuccess?.({
            vault: vaultData,
            transforms: {},
            dataKinds: {},
          });
          toast.show({
            description: t('success-toast.description'),
            title: t('success-toast.title'),
            variant: 'default',
          });
        },
        onError: (error: unknown) => {
          send(Event.editFailed);
          let errorMessage = getErrorMessage(error);
          if (typeof errorMessage === 'object') {
            errorMessage = `Editing '${Object.keys(errorMessage).join(
              ', ',
            )}' failed: ${Object.values(errorMessage).join(', ')}`;
          }
          toast.show({
            description: errorMessage,
            title: t('error-toast.title'),
            variant: 'error',
          });
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
