import { DecryptTextResponse, EntityVault } from '@onefootprint/types';

import type {
  DocumentField,
  IdDocumentField,
  TextField,
} from '../../../../../decrypt-machine';
import useDecryptText from './hooks/use-decrypt-text';
import transformResponseToVaultFormat from './utils/transform-response-to-vault-format';

type DecryptPayload = {
  userId: string;
  reason?: string;
  textFields?: TextField[];
  idDocumentFields?: IdDocumentField[];
  documentFields?: DocumentField[];
};

type DecryptCallbacks = {
  onSuccess?: (response: EntityVault) => void;
  onError?: (error: unknown) => void;
};

const useDecryptFields = () => {
  const decryptText = useDecryptText();

  const decryptFields = (
    { userId, reason = '', textFields }: DecryptPayload,
    { onSuccess, onError }: DecryptCallbacks,
  ) => {
    const promises: Promise<DecryptTextResponse>[] = [];
    if (textFields && textFields.length) {
      const decryptPromise = decryptText.mutateAsync({
        userId,
        fields: textFields,
        reason,
      });
      promises.push(decryptPromise);
    }
    Promise.all(promises)
      .then(response => {
        onSuccess?.(transformResponseToVaultFormat(response));
      })
      .catch(onError);
  };

  return decryptFields;
};

export default useDecryptFields;
