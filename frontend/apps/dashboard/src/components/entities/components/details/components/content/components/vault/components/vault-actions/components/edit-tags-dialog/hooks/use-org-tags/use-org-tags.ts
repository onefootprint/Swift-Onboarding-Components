import request from '@onefootprint/request';
import { EntityKind, type GetOrgTagsResponse, type OrgTag } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getOrgTags = async (authHeaders: AuthHeaders, kind: EntityKind) => {
  const response = await request<GetOrgTagsResponse>({
    method: 'GET',
    url: 'org/tags',
    headers: authHeaders,
    params: { kind },
  });
  return response.data;
};

const useOrgTags = (kind: EntityKind) => {
  const { authHeaders } = useSession();

  const tagsQuery = useQuery({
    queryKey: ['org', 'tags', authHeaders],
    queryFn: () => getOrgTags(authHeaders, kind),
    select: (tags: GetOrgTagsResponse) => {
      const formattedTags = {} as Record<EntityKind, OrgTag[]>;
      Object.values(EntityKind).forEach(kind => {
        formattedTags[kind] = [];
      });
      tags.forEach(({ id, kind, tag }) => {
        formattedTags[kind as EntityKind].push({
          id,
          kind,
          text: tag,
        } as OrgTag);
      });
      return formattedTags;
    },
  });

  return {
    ...tagsQuery,
    error: tagsQuery.error ?? undefined,
    response: tagsQuery.data,
  };
};

export default useOrgTags;
