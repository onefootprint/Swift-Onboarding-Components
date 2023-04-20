import request, { PaginatedRequestResponse } from '@onefootprint/request';
import {
  EntityKind,
  GetEntitiesRequest,
  GetEntitiesResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getEntities = async (
  authHeaders: AuthHeaders,
  params: GetEntitiesRequest,
) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetEntitiesResponse>
  >({
    method: 'GET',
    url: '/entities',
    headers: authHeaders,
    params,
  });

  return response;
};

const useEntities = (kind: EntityKind) => {
  const { authHeaders } = useSession();
  return useQuery(['entities', kind, {}, authHeaders], () =>
    getEntities(authHeaders, { kind, page_size: '10' }),
  );
};

export default useEntities;
