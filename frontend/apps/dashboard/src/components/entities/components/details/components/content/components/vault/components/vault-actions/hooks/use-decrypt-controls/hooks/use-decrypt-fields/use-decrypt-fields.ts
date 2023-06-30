import { DataIdentifier, EntityVault, VaultValue } from '@onefootprint/types';

import useDecryptText from './hooks/use-decrypt';
import getDiFields from './utils/get-doc-dis';
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

  const decryptFields = (
    { entityId, reason = '', dis, vaultData }: DecryptPayload,
    { onSuccess, onError }: DecryptCallbacks,
  ) => {
    if (dis && dis.length) {
      decryptText
        .mutateAsync({
          entityId,
          fields: getDiFields(dis, vaultData),
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
