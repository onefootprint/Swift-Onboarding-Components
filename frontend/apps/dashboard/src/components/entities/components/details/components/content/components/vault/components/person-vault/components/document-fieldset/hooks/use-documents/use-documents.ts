import request from '@onefootprint/request';
import type { Document } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';
import sortDocumentsAndUploads from '../../utils/sort-documents';
import transformUploadsWithDocuments from '../../utils/transform-uploads-with-is-latest';

type GetDocumentsRequest = {
  entityId: string;
  seqno?: string;
};

type GetDocumentsResponse = Document[];

const getDocuments = async (authHeaders: AuthHeaders, { entityId, seqno }: GetDocumentsRequest) => {
  const response = await request<GetDocumentsResponse>({
    method: 'GET',
    url: `/entities/${entityId}/documents`,
    headers: authHeaders,
    params: { seqno },
  });

  return response.data;
};

const useDocuments = (id: string, seqno?: string) => {
  const { authHeaders } = useSession();
  const requestParams = { entityId: id, seqno };

  return useQuery({
    queryKey: ['entities', id, 'documents', requestParams, authHeaders],
    queryFn: () => getDocuments(authHeaders, { ...requestParams }),
    enabled: !!id,
    select: (documents: Document[]) => {
      const sortedDocuments = sortDocumentsAndUploads(documents);
      const docsWithIsLatest = sortedDocuments.map(doc => ({
        ...doc,
        uploads: transformUploadsWithDocuments(doc.uploads),
      }));
      return docsWithIsLatest;
    },
  });
};

export default useDocuments;
