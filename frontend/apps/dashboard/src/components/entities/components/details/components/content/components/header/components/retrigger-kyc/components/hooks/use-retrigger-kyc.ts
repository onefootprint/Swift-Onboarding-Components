import request from '@onefootprint/request';
import { TriggerRequest, TriggerResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const submitRetriggerKYC = async (
  authHeaders: AuthHeaders,
  { entityId, ...data }: TriggerRequest,
) => {
  const response = await request<TriggerResponse>({
    method: 'POST',
    url: `/entities/${entityId}/trigger`,
    data,
    headers: authHeaders,
  });
  return response.data;
};

const useRetriggerKYC = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TriggerRequest) => submitRetriggerKYC(authHeaders, data),
    onSuccess: () => {
      queryClient.refetchQueries();
    },
  });
};

export default useRetriggerKYC;
