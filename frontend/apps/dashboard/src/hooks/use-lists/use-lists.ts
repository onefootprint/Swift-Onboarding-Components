import type { PaginatedRequestResponse } from '@onefootprint/request';
import request, { getErrorMessage } from '@onefootprint/request';
import type { GetListsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getLists = async (authHeaders: AuthHeaders) => {
  const response = await request<PaginatedRequestResponse<GetListsResponse>>({
    method: 'GET',
    url: '/org/lists',
    headers: authHeaders,
  });

  return response.data;
};

const useLists = () => {
  const { authHeaders } = useSession();
  const listsQuery = useQuery({
    queryKey: ['lists', authHeaders],
    queryFn: () => getLists(authHeaders),
  });
  const { error } = listsQuery;
  const errorMessage = error ? getErrorMessage(error) : undefined;

  return {
    ...listsQuery,
    errorMessage,
  };
};

export default useLists;
