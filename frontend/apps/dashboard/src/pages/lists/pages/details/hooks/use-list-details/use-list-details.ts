import request, { getErrorMessage } from '@onefootprint/request';
import type { GetListDetailsRequest, GetListDetailsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const getListDetails = async ({ authHeaders, id }: GetListDetailsRequest) => {
  const response = await request<GetListDetailsResponse>({
    method: 'GET',
    url: `/org/lists/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const useListDetails = (id = '') => {
  const { authHeaders } = useSession();
  const query = useQuery({
    queryKey: ['lists', id, authHeaders],
    queryFn: () => getListDetails({ authHeaders, id }),
  });
  const { error } = query;
  const errorMessage = error ? getErrorMessage(error) : undefined;

  return {
    ...query,
    errorMessage,
  };
};

export default useListDetails;
