import request from '@onefootprint/request';
import type { EntityActionsRequest, EntityActionsResponse } from '@onefootprint/types/src/api/entity-actions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const submitActions = async (authHeaders: AuthHeaders, { entityId, ...data }: EntityActionsRequest) => {
  const response = await request<EntityActionsResponse>({
    method: 'POST',
    url: `/entities/${entityId}/actions`,
    data,
    headers: authHeaders,
  });
  return response.data;
};

const useSubmitActions = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EntityActionsRequest) => submitActions(authHeaders, data),
    onSuccess: () => {
      queryClient.refetchQueries();
    },
  });
};

export default useSubmitActions;
