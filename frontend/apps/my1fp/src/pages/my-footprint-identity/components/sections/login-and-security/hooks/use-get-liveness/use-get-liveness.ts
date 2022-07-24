import { useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';
import useSessionUser from 'src/hooks/use-session-user';

import { InsightEvent } from '../../../access-logs/types';

export type GetLivenessRequest = {
  authToken: string;
};

export type GetLivenessResponse = {
  data: InsightEvent[];
};

const getLiveness = async (payload: GetLivenessRequest) => {
  const { data: response } = await request<
    RequestResponse<GetLivenessResponse>
  >({
    method: 'GET',
    url: '/user/liveness',
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });

  return response.data;
};

const useGetLiveness = () => {
  const { session } = useSessionUser();
  const authToken = session?.authToken || '';

  return useQuery<GetLivenessResponse, RequestError>(
    ['get-liveness', authToken],
    () => getLiveness({ authToken }),
    {
      enabled: !!authToken,
    },
  );
};

export default useGetLiveness;
