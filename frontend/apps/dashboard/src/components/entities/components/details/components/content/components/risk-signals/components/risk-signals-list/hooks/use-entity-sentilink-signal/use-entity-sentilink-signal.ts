import request from '@onefootprint/request';
import type { GetEntitySentilinkSignalRequest, GetEntitySentilinkSignalResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';
import type { AuthHeaders } from 'src/hooks/use-session';

type UseEntitySentilinkSignalProps = {
  entityId: string;
  riskSignalId?: string;
};

const getSentilinkSignal = async (payload: GetEntitySentilinkSignalRequest, authHeaders: AuthHeaders) => {
  const { data: response } = await request<GetEntitySentilinkSignalResponse>({
    headers: authHeaders,
    method: 'POST',
    url: `/entities/${payload.entityId}/sentilink/${payload.riskSignalId}`,
  });
  return response;
};

const useEntitySentilinkSignal = ({ entityId, riskSignalId = '' }: UseEntitySentilinkSignalProps) => {
  const { authHeaders } = useSession();
  return useQuery({
    queryKey: ['entity', entityId, 'sentilink', riskSignalId],
    queryFn: () => getSentilinkSignal({ entityId, riskSignalId }, authHeaders),
    enabled: !!riskSignalId,
  });
};

export default useEntitySentilinkSignal;
