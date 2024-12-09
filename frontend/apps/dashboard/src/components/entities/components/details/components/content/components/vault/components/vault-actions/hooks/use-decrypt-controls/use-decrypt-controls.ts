import { useRequestErrorToast } from '@onefootprint/hooks';
import {
  type DataIdentifier,
  type Entity,
  type EntityVault,
  SupportedIdDocTypes,
  type VaultValue,
} from '@onefootprint/types';

import useCurrentEntity from '@/entity/hooks/use-current-entity';
import useDocuments from '@/entity/hooks/use-documents';
import useEntityId from '@/entity/hooks/use-entity-id';
import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import getDecryptableDIs from 'src/utils/get-decryptable-dis';
import isDiDecryptable from 'src/utils/is-di-decryptable';
import { Event, State, useDecryptMachine } from '../../../../../decrypt-machine';
import useDecryptFields from './hooks/use-decrypt-fields';

const DECRYPT_MANUALLY_TIMEOUT = 800;

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
  const seqno = useEntitySeqno();
  const { data: entity } = useCurrentEntity();
  const { data: documents } = useDocuments(entityId, seqno);

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

  const getAllDecryptableDocuments = () => {
    const decryptableDocumentKinds = (documents || [])
      // TODO: fix the types
      .filter(d => d.uploads.map(u => u.identifier).every(di => isDiDecryptable(entity as Entity, di)))
      // Custom documents are currently handled in another section and are just decrypted by DI
      .filter(d => d.kind !== SupportedIdDocTypes.custom)
      .map(d => d.kind);
    return [...new Set(decryptableDocumentKinds)];
  };

  /** Decrypt all decryptable fields on the vault */
  const submitAllFields = () => {
    const documentKinds = getAllDecryptableDocuments();
    // TODO: fix the types
    const decryptableDIs = getDecryptableDIs(entity as Entity);
    submitFields(decryptableDIs, documentKinds);
  };

  const submitAllFieldsHistorical = (historicalFields: DataIdentifier[]) => {
    const documentKinds = getAllDecryptableDocuments();
    submitFields(historicalFields, documentKinds);
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
    seqno?: string | undefined,
  ) => {
    const { reason, dis = [], documents = [] } = context;
    decryptFields(
      { reason, dis, documents, entityId, vaultData, seqno },
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

  /** Used for vault editing: decrypts the provided fields with the provided reason, moving directly from idle to submittedReason state */
  const decryptManually = (
    payload: {
      reason: string;
      dis?: DataIdentifier[];
      documents?: SupportedIdDocTypes[];
      entityId: string;
      vaultData?: Partial<Record<DataIdentifier, VaultValue>>;
    },
    callbacks?: {
      onSuccess?: (response: EntityVault) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    const { reason, dis = [], documents = [], entityId, vaultData = {} } = payload;

    const documentKinds = getAllDecryptableDocuments();
    send(Event.submittedReason, { payload: { reason, fields: dis, documents: documentKinds } });

    setTimeout(() => {
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
    }, DECRYPT_MANUALLY_TIMEOUT);
  };

  /** Used for onboardings: same as decryptManually, but bipasses the state machine to avoid opening the ReasonDialog */
  // TODO: consolidate with decryptToViewDocumentDetails
  const decryptWithoutMachine = (
    payload: {
      reason: string;
      dis?: DataIdentifier[];
      documents?: SupportedIdDocTypes[];
      entityId: string;
      vaultData?: Partial<Record<DataIdentifier, VaultValue>>;
    },
    callbacks?: {
      onSuccess?: (response: EntityVault) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    const { reason, dis = [], documents = [], entityId, vaultData = {} } = payload;
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

  const decryptToViewDocumentDetails = (
    payload: {
      documents: SupportedIdDocTypes[];
      entityId: string;
      vaultData?: Partial<Record<DataIdentifier, VaultValue>>;
    },
    callbacks?: {
      onSuccess?: (response: EntityVault) => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    const { documents, entityId, vaultData = {} } = payload;
    decryptFields(
      { reason: 'Viewing document details', dis: [], documents, entityId, vaultData },
      {
        onSuccess: results => {
          callbacks?.onSuccess?.(results);
        },
        onError: (error: unknown) => {
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
    submitAllFieldsHistorical,
    inProgress,
    inProgressDecryptingAll,
    decrypt,
    decryptManually,
    decryptWithoutMachine,
    decryptToViewDocumentDetails,
  };
};

export default useDecryptControls;
