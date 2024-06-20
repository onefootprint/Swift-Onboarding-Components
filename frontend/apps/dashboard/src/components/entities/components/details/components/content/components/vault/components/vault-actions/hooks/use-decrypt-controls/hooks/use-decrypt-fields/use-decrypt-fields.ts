import type { DataIdentifier, EntityVault, VaultValue } from '@onefootprint/types';
import useDocuments from 'src/components/entities/components/details/hooks/use-documents';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';

import transformResponseToVaultFormat from '../../../utils/transform-response-to-vault-format';
import useDecryptText from './hooks/use-decrypt';
import getDocDis from './utils/get-doc-dis';

type DecryptPayload = {
  entityId: string;
  reason?: string;
  dis?: DataIdentifier[];
  vaultData?: Partial<Record<DataIdentifier, VaultValue>>;
  seqno?: string | undefined;
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
    { reason = '', dis, vaultData, seqno }: DecryptPayload,
    { onSuccess, onError }: DecryptCallbacks,
  ) => {
    if (dis && dis.length) {
      const formattedDIs = seqno ? dis.map(di => `${di}:${seqno}`) : dis;
      const fields = getDocDis({ dis: formattedDIs, documents, vaultData });
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
