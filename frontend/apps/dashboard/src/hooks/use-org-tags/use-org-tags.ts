import request from '@onefootprint/request';
import type { EntityKind, GetOrgTagsResponse } from '@onefootprint/types';
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

  return useQuery({
    queryKey: ['org', 'tags', authHeaders],
    queryFn: () => getOrgTags(authHeaders, kind),
    enabled: !!kind,
  });
};

export default useOrgTags;
