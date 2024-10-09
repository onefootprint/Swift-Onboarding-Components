import request from '@onefootprint/request';
import type { GetTagsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getTags = async (authHeaders: AuthHeaders, id: string) => {
  const response = await request<GetTagsResponse>({
    method: 'GET',
    url: `/entities/${id}/tags`,
    headers: authHeaders,
  });
  return response.data;
};

const useEntityTags = (id: string) => {
  const { authHeaders } = useSession();
  return useQuery({
    queryKey: ['entities', id, 'tags', authHeaders],
    queryFn: () => getTags(authHeaders, id),
    enabled: !!id,
  });
};

export default useEntityTags;
