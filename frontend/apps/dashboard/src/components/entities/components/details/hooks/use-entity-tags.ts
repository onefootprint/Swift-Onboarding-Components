import { getEntitiesByFpIdTagsOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const useEntityTags = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery({
    ...getEntitiesByFpIdTagsOptions({
      path: { fpId: id },
      headers: { 'X-Fp-Dashboard-Authorization': authHeaders['x-fp-dashboard-authorization'] },
    }),
    enabled: !!id,
  });
};

export default useEntityTags;
