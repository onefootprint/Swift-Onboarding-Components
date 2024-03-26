import request, { getErrorMessage } from '@onefootprint/request';
import type { GetListsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getLists = async (authHeaders: AuthHeaders) => {
  const response = await request<GetListsResponse>({
    method: 'GET',
    url: '/org/lists',
    headers: authHeaders,
  });

  return response;
};

const useLists = () => {
  const { authHeaders, isLive } = useSession();
  const listsQuery = useQuery(['lists', isLive], () => getLists(authHeaders));
  const { error } = listsQuery;
  const errorMessage = error ? getErrorMessage(error) : undefined;

  return {
    ...listsQuery,
    errorMessage,
  };
};

export default useLists;
