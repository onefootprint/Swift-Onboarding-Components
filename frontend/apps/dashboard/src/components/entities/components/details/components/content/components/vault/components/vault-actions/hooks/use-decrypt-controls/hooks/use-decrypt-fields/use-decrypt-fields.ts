import type {
  DataIdentifier,
  EntityVault,
  VaultValue,
} from '@onefootprint/types';
import useDocuments from 'src/components/entities/components/details/hooks/use-documents';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';

import useDecryptText from './hooks/use-decrypt';
import getDocDis from './utils/get-doc-dis';
import transformResponseToVaultFormat from './utils/transform-response-to-vault-format';

type DecryptPayload = {
  entityId: string;
  reason?: string;
  dis?: DataIdentifier[];
  vaultData?: Partial<Record<DataIdentifier, VaultValue>>;
};

type DecryptCallbacks = {
  onSuccess?: (response: EntityVault) => void;
  onError?: (error: unknown) => void;
};

const useDecryptFields = () => {
  const decryptText = useDecryptText();
  const entityId = useEntityId();
  const { data: documents } = useDocuments(entityId);

  const decryptFields = (
    { reason = '', dis, vaultData }: DecryptPayload,
    { onSuccess, onError }: DecryptCallbacks,
  ) => {
    if (dis && dis.length) {
      const fields = getDocDis({ dis, documents, vaultData });
      decryptText
        .mutateAsync({
          entityId,
          fields,
          reason,
        })
        .then(transformResponseToVaultFormat)
        .then(onSuccess)
        .catch(onError);
    }
  };

  return decryptFields;
};

export default useDecryptFields;
