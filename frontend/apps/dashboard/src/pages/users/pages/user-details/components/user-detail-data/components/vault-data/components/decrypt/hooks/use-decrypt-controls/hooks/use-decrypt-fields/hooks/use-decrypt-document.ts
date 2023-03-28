import request from '@onefootprint/request';
import {
  DecryptDocumentRequest,
  DecryptDocumentResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const decryptDocument = async (
  { userId, kind, reason }: DecryptDocumentRequest,
  authHeaders: AuthHeaders,
): Promise<DecryptDocumentResponse> => {
  const response = await request<string>({
    method: 'POST',
    url: `/users/${userId}/vault/document/decrypt`,
    data: {
      kind,
      reason,
    },
    headers: {
      responseType: 'blob',
      ...authHeaders,
    },
  });
  return {
    dataIdentifier: kind,
    content: new Blob([response.data], {
      type: 'application/pdf',
    }),
  };
};

const useDecryptDocument = () => {
  const { authHeaders } = useSession();
  return useMutation((data: DecryptDocumentRequest) =>
    decryptDocument(data, authHeaders),
  );
};

export default useDecryptDocument;
