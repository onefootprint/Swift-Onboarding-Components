import request from '@onefootprint/request';
import type { TriggerRequest, TriggerResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const submitTrigger = async (
  authHeaders: AuthHeaders,
  { entityId, ...data }: TriggerRequest,
) => {
  const response = await request<TriggerResponse>({
    method: 'POST',
    url: `/entities/${entityId}/triggers`,
    data,
    headers: authHeaders,
  });
  return response.data;
};

const useCreateTrigger = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TriggerRequest) => submitTrigger(authHeaders, data),
    onSuccess: () => {
      queryClient.refetchQueries();
    },
  });
};

export default useCreateTrigger;
