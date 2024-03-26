import request from '@onefootprint/request';
import type {
  GetListDetailsRequest,
  GetListDetailsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const getListDetails = async ({
  authHeaders,
  listId,
}: GetListDetailsRequest) => {
  const { data: response } = await request<GetListDetailsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `org/lists/${listId}/entries`,
  });

  return response;
};

const useListDetails = (listId = '') => {
  const { authHeaders } = useSession();

  return useQuery(
    ['list', listId],
    () => getListDetails({ authHeaders, listId }),
    {
      enabled: !!listId,
    },
  );
};

export default useListDetails;
