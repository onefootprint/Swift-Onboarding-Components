import request from '@onefootprint/request';
import { type Document, SupportedIdDocTypes } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import partition from 'lodash/partition';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';
import sortDocumentsAndUploads from '../../utils/sort-documents';
import transformUploadsWithDocuments from '../../utils/transform-uploads-with-documents';

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

const useUploadsAndDocuments = (id: string, seqno?: string) => {
  const { authHeaders } = useSession();
  const requestParams = { entityId: id, seqno };

  return useQuery({
    queryKey: ['entities', id, 'documents', requestParams, authHeaders],
    queryFn: () => getDocuments(authHeaders, { ...requestParams }),
    enabled: !!id,
    select: (documents: Document[]) => {
      const sortedDocuments = sortDocumentsAndUploads(documents);

      // Separate driver's license uploads, because they are displayed differently than the others
      const [licenseDocuments, otherDocuments] = partition(
        sortedDocuments,
        doc => doc.kind === SupportedIdDocTypes.driversLicense,
      );
      // Transform sorted documents into array of each document's uploads
      const uploadsWithDocuments = transformUploadsWithDocuments(otherDocuments);

      return {
        licenseDocuments,
        uploadsWithDocuments,
      };
    },
  });
};

export default useUploadsAndDocuments;
