import { EntityVault } from '@onefootprint/types';

import type { DiField } from '../../../../../decrypt-machine';
import useDecryptText from './hooks/use-decrypt';
import transformResponseToVaultFormat from './utils/transform-response-to-vault-format';

type DecryptPayload = {
  userId: string;
  reason?: string;
  diFields?: DiField[];
};

type DecryptCallbacks = {
  onSuccess?: (response: EntityVault) => void;
  onError?: (error: unknown) => void;
};

const useDecryptFields = () => {
  const decryptText = useDecryptText();

  const decryptFields = (
    { userId, reason = '', diFields }: DecryptPayload,
    { onSuccess, onError }: DecryptCallbacks,
  ) => {
    if (diFields && diFields.length) {
      decryptText
        .mutateAsync({
          userId,
          fields: diFields,
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
