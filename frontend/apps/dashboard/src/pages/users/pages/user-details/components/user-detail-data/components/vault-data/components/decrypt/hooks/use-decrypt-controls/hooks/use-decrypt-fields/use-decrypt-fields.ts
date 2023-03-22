import {
  DecryptIdDocumentResponse,
  DecryptTextResponse,
  Vault,
} from '@onefootprint/types';

import type {
  IdDocumentField,
  TextField,
} from '../../../../components/machine-provider';
import useDecryptIdDocuments from './hooks/use-decrypt-id-docs';
import useDecryptText from './hooks/use-decrypt-text';
import { groupResponseByKind, groupResponseKindsByVault } from './utils';

type DecryptPayload = {
  userId: string;
  reason?: string;
  textFields?: TextField[];
  idDocumentFields?: IdDocumentField[];
};

type DecryptCallbacks = {
  onSuccess?: (response: Vault) => void;
  onError?: (error: unknown) => void;
};

const useDecryptFields = () => {
  const decryptText = useDecryptText();
  const decryptDocuments = useDecryptIdDocuments();

  const decryptFields = (
    { userId, reason = '', textFields, idDocumentFields }: DecryptPayload,
    { onSuccess, onError }: DecryptCallbacks,
  ) => {
    const promises: Promise<DecryptIdDocumentResponse | DecryptTextResponse>[] =
      [];
    if (textFields && textFields.length) {
      const decryptTextPromise = decryptText.mutateAsync({
        userId,
        fields: textFields,
        reason,
      });
      promises.push(decryptTextPromise);
    }
    if (idDocumentFields && idDocumentFields.length) {
      idDocumentFields.forEach(documentIdentifier => {
        const decryptTextFieldsPromise = decryptDocuments.mutateAsync({
          userId,
          documentIdentifier,
          reason,
        });
        promises.push(decryptTextFieldsPromise);
      });
    }
    Promise.all(promises)
      .then(responses => {
        const { text, idDocuments } = groupResponseByKind(responses);
        const vault = groupResponseKindsByVault({
          text,
          idDocuments,
        });
        onSuccess?.(vault);
      })
      .catch(onError);
  };

  return decryptFields;
};

export default useDecryptFields;
