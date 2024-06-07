import request from '@onefootprint/request';
import type { GetEntityMatchSignalsRequest, GetEntityMatchSignalsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import transformResponse from './utils/transform-response';

type UseEntityMatchSignalsProps = {
  id: string;
};

const getMatchSignals = async (payload: GetEntityMatchSignalsRequest, authHeaders: AuthHeaders) => {
  const { id } = payload;
  const { data: response } = await request<GetEntityMatchSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${id}/match_signals`,
  });
  return response;
};

const useEntityMatchSignals = ({ id }: UseEntityMatchSignalsProps) => {
  const { authHeaders } = useSession();

  return useQuery(['entity', id, 'match_signals'], () => getMatchSignals({ id }, authHeaders), {
    select: transformResponse,
  });
};

export default useEntityMatchSignals;
