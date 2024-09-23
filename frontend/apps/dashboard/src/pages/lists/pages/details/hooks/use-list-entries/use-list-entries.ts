import request from '@onefootprint/request';
import type { GetListEntriesRequest, GetListEntriesResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const getListEntries = async ({ authHeaders, listId }: GetListEntriesRequest) => {
  const { data: response } = await request<GetListEntriesResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `org/lists/${listId}/entries`,
  });

  return response;
};

const useListEntries = (listId = '') => {
  const { authHeaders } = useSession();

  return useQuery({
    queryKey: ['list-entries', listId, authHeaders],
    queryFn: () => getListEntries({ authHeaders, listId }),
    enabled: !!listId,
  });
};

export default useListEntries;
