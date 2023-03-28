import {
  DecryptDocumentResponse,
  DecryptIdDocumentResponse,
  DecryptTextResponse,
  Vault,
} from '@onefootprint/types';

import type {
  DocumentField,
  IdDocumentField,
  TextField,
} from '../../../../components/machine-provider';
import {
  useDecryptDocument,
  useDecryptIdDocument,
  useDecryptText,
} from './hooks';
import { groupResponseByKind, groupResponseKindsByVault } from './utils';

type DecryptPayload = {
  userId: string;
  reason?: string;
  textFields?: TextField[];
  idDocumentFields?: IdDocumentField[];
  documentFields?: DocumentField[];
};

type DecryptCallbacks = {
  onSuccess?: (response: Vault) => void;
  onError?: (error: unknown) => void;
};

const useDecryptFields = () => {
  const decryptText = useDecryptText();
  const decryptIdDocument = useDecryptIdDocument();
  const decryptDocument = useDecryptDocument();

  const decryptFields = (
    {
      userId,
      reason = '',
      textFields,
      idDocumentFields,
      documentFields,
    }: DecryptPayload,
    { onSuccess, onError }: DecryptCallbacks,
  ) => {
    const promises: Promise<
      DecryptIdDocumentResponse | DecryptTextResponse | DecryptDocumentResponse
    >[] = [];
    if (textFields && textFields.length) {
      const decryptPromise = decryptText.mutateAsync({
        userId,
        fields: textFields,
        reason,
      });
      promises.push(decryptPromise);
    }
    if (idDocumentFields && idDocumentFields.length) {
      idDocumentFields.forEach(documentIdentifier => {
        const decryptPromise = decryptIdDocument.mutateAsync({
          userId,
          documentIdentifier,
          reason,
        });
        promises.push(decryptPromise);
      });
    }
    if (documentFields && documentFields.length) {
      documentFields.forEach(documentField => {
        const decryptDocumentPromise = decryptDocument.mutateAsync({
          userId,
          kind: documentField,
          reason,
        });
        promises.push(decryptDocumentPromise);
      });
    }
    Promise.all(promises)
      .then(responses => {
        const { text, idDocuments, documents } = groupResponseByKind(responses);
        const vault = groupResponseKindsByVault({
          text,
          idDocuments,
          documents,
        });
        onSuccess?.(vault);
      })
      .catch(onError);
  };

  return decryptFields;
};

export default useDecryptFields;
