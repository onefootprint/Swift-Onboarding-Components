import request from '@onefootprint/request';
import type { GetHistoricalEntityDataRequest, GetHistoricalEntityDataResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getHistoricalEntityData = async (authHeaders: AuthHeaders, { id, seqno }: GetHistoricalEntityDataRequest) => {
  const response = await request<GetHistoricalEntityDataResponse>({
    method: 'GET',
    url: `/entities/${id}/data`,
    headers: authHeaders,
    params: { seqno },
  });

  return response.data;
};

const useHistoricalEntityData = (
  id: string,
  seqno: string | undefined,
  callbacks?: {
    onSuccess?: (response: GetHistoricalEntityDataResponse) => void;
    onError?: (error: unknown) => void;
  },
) => {
  const isReady = useRouter();
  const { authHeaders } = useSession();

  return useQuery({
    queryKey: ['entity', id, 'data', 'seqno', seqno, authHeaders],
    queryFn: () => getHistoricalEntityData(authHeaders, { id, seqno }),
    enabled: isReady && !!id && !!seqno,
    ...callbacks,
  });
};

export default useHistoricalEntityData;
