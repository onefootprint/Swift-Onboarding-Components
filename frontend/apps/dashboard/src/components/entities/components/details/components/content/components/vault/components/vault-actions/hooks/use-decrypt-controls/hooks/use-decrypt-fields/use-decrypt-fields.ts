import type { DataIdentifier, EntityVault, SupportedIdDocTypes, VaultValue } from '@onefootprint/types';
import useDocuments from 'src/components/entities/components/details/hooks/use-documents';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';

import transformResponseToVaultFormat from '../../../utils/transform-response-to-vault-format';
import useDecryptText from './hooks/use-decrypt';
import getDocDis from './utils/get-doc-dis';

type DecryptPayload = {
  entityId: string;
  reason?: string;
  dis?: DataIdentifier[];
  documents?: SupportedIdDocTypes[];
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
    { reason = '', dis = [], documents: documentKinds = [], vaultData }: DecryptPayload,
    { onSuccess, onError }: DecryptCallbacks,
  ) => {
    if (!dis.length && !documentKinds.length) {
      return;
    }
    const docDis = getDocDis({ documentKinds, documents, vaultData });
    const fields = [...dis, ...docDis];
    decryptText
      .mutateAsync({
        entityId,
        fields,
        reason,
      })
      .then(transformResponseToVaultFormat)
      .then(onSuccess)
      .catch(onError);
  };

  return decryptFields;
};

export default useDecryptFields;
