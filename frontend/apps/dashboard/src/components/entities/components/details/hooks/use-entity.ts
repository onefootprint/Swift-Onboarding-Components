import { getEntitiesByFpIdOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

export const useEntity = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(
    getEntitiesByFpIdOptions({
      headers: { 'X-Fp-Dashboard-Authorization': authHeaders['x-fp-dashboard-authorization'] },
      path: { fpId: id },
    }),
  );
};

export default useEntity;
