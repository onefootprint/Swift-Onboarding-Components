import request from '@onefootprint/request';
import {
  DecryptIdDocumentRequest,
  DecryptIdDocumentResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decryptIdDocument = async (
  { userId, reason, documentIdentifier }: DecryptIdDocumentRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await request<DecryptIdDocumentResponse>({
    method: 'POST',
    url: `/users/${userId}/vault/identity/document/decrypt`,
    data: {
      reason,
      documentIdentifier,
      includeSelfie: true, // For now, we always decrypt selfie with id doc
    },
    headers: authHeaders,
  });

  return response.data;
};

const useDecryptIdDocument = () => {
  const { authHeaders } = useSession();
  return useMutation((data: DecryptIdDocumentRequest) =>
    decryptIdDocument(data, authHeaders),
  );
};

export default useDecryptIdDocument;
