import request from '@onefootprint/request';
import {
  GetEntityMatchSignalsRequest,
  GetEntityMatchSignalsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import transformResponse from './utils/transform-response';

const getMatchSignals = async (
  payload: GetEntityMatchSignalsRequest,
  authHeaders: AuthHeaders,
) => {
  const { id } = payload;
  const { data: response } = await request<GetEntityMatchSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${id}/match_signals`,
  });
  return response;
};

const useEntityMatchSignals = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(
    ['entity', id, 'match_signals'],
    () => getMatchSignals({ id }, authHeaders),
    { select: transformResponse },
  );
};

export default useEntityMatchSignals;
