import request, { getErrorMessage } from '@onefootprint/request';
import type {
  GetListRequest,
  GetListResponse,
  List,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const getList = async ({ authHeaders, id }: GetListRequest) => {
  const response = await request<GetListResponse>({
    method: 'GET',
    url: `/org/lists/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const useList = (id = '') => {
  const { authHeaders, isLive } = useSession();
  const query = useQuery<List>(['lists', isLive], () =>
    getList({ authHeaders, id }),
  );
  const { error } = query;
  const errorMessage = error ? getErrorMessage(error) : undefined;

  return {
    ...query,
    errorMessage,
  };
};

export default useList;
