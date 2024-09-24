import { useRequestErrorToast } from '@onefootprint/hooks';
import { type DataIdentifier, type EntityVault, SupportedIdDocTypes, type VaultValue } from '@onefootprint/types';

import useCurrentEntity from 'src/components/entities/components/details/hooks/use-current-entity';
import useDocuments from 'src/components/entities/components/details/hooks/use-documents';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';
import { Event, State, useDecryptMachine } from '../../../../../decrypt-machine';
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
  const isPending = state.matches(State.decrypting) || state.matches(State.decryptingAll);
  const inProgress =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.confirmingDecryptAllReason) ||
    state.matches(State.decrypting) ||
    state.matches(State.decryptingAll);
  const inProgressDecryptingAll = state.matches(State.confirmingDecryptAllReason) || state.matches(State.decryptingAll);
  const entityId = useEntityId();
  const { data: entity } = useCurrentEntity();
  const { data: documents } = useDocuments(entityId);

  const start = () => {
    send(Event.started);
  };

  const cancel = () => {
    send(Event.canceled);
  };

  /** Decrypt the provided fields */
  const submitFields = (fields: DataIdentifier[] | undefined, documents: SupportedIdDocTypes[]) => {
    send(Event.submittedFields, { payload: { fields, documents } });
  };

  /** Decrypt all decryptable fields on the vault */
  const submitAllFields = () => {
    const decryptableDocumentKinds = (documents || [])
      .filter(d => d.uploads.map(u => u.identifier).every(di => entity?.decryptableAttributes.includes(di)))
      // Custom documents are currently handled in another section and are just decrypted by DI
      .filter(d => d.kind !== SupportedIdDocTypes.custom)
      .map(d => d.kind);
    const documentKinds = [...new Set(decryptableDocumentKinds)];
    submitFields(entity?.decryptableAttributes, documentKinds);
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
    const { reason, dis = [], documents = [] } = context;
    decryptFields(
      { reason, dis, documents, entityId, vaultData },
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
    isPending,
    submitFields,
    submitAllFields,
    inProgress,
    inProgressDecryptingAll,
    decrypt,
  };
};

export default useDecryptControls;
