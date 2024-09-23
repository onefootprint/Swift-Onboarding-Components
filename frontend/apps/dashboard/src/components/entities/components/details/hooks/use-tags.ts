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

const useTags = (id: string) => {
  const { authHeaders } = useSession();

  const tagsQuery = useQuery({
    queryKey: ['entities', id, 'tags', authHeaders],
    queryFn: () => getTags(authHeaders, id),
    enabled: !!id,
    select: (tags: { id: string; tag: string }[]) => tags.map(({ id, tag }) => ({ id, text: tag })),
  });

  const { error, data } = tagsQuery;
  return {
    ...tagsQuery,
    error: error ?? undefined,
    response: data,
  };
};

export default useTags;
