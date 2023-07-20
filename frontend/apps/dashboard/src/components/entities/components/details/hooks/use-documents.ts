import request, { PaginatedRequestResponse } from '@onefootprint/request';
import { Document } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

type GetDocumentsRequest = {
  entityId: string;
};

type GetDocumentsResponse = Document[];

const getDocuments = async (
  authHeaders: AuthHeaders,
  { entityId }: GetDocumentsRequest,
) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetDocumentsResponse>
  >({
    method: 'GET',
    url: `/entities/${entityId}/documents`,
    headers: authHeaders,
  });

  return response;
};

const useDocuments = (id: string) => {
  const { authHeaders } = useSession();
  const requestParams = { entityId: id };

  return useQuery(
    ['entities', id, 'documents', requestParams, authHeaders],
    () => getDocuments(authHeaders, { ...requestParams }),
  );
};

export default useDocuments;
