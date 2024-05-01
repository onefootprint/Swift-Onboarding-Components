import request from '@onefootprint/request';
import type { Document } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

type GetDocumentsRequest = {
  entityId: string;
};

type GetDocumentsResponse = Document[];

const getDocuments = async (
  authHeaders: AuthHeaders,
  { entityId }: GetDocumentsRequest,
) => {
  const response = await request<GetDocumentsResponse>({
    method: 'GET',
    url: `/entities/${entityId}/documents`,
    headers: authHeaders,
  });

  return response.data;
};

const useDocuments = (id: string) => {
  const { authHeaders } = useSession();
  const requestParams = { entityId: id };

  return useQuery(
    ['entities', id, 'documents', requestParams, authHeaders],
    () => getDocuments(authHeaders, { ...requestParams }),
    {
      enabled: !!id,
      select: documents => {
        documents.sort((doc1, doc2) => {
          if (!doc1.startedAt || !doc2.startedAt) return 0;
          return (
            new Date(doc1.startedAt).getTime() -
            new Date(doc2.startedAt).getTime()
          );
        });
        return documents;
      },
    },
  );
};

export default useDocuments;
