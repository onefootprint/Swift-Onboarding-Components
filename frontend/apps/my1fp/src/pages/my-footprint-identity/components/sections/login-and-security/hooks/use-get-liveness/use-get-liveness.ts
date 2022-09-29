import request, { RequestError } from '@onefootprint/request';
import { InsightEvent } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';
import useSessionUser from 'src/hooks/use-session-user';

export type GetLivenessRequest = {
  authToken: string;
};

export type InsightEventEntry = {
  insightEvent: InsightEvent;
};
export type GetLivenessResponse = InsightEvent[];

const getLiveness = async (payload: GetLivenessRequest) => {
  const response = await request<InsightEventEntry[]>({
    method: 'GET',
    url: '/hosted/user/liveness',
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });

  return response.data.map(e => e.insightEvent);
};

const useGetLiveness = (
  options: {
    onSuccess?: (data: GetLivenessResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const { session } = useSessionUser();
  const authToken = session?.authToken || '';

  return useQuery<GetLivenessResponse, RequestError>(
    ['get-liveness', authToken],
    () => getLiveness({ authToken }),
    {
      enabled: !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetLiveness;
