import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { UpdateListRequest } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updateList = async (listId: string, payload: UpdateListRequest, authHeaders: AuthHeaders) => {
  const response = await request({
    method: 'PATCH',
    url: `/org/lists/${listId}`,
    data: payload,
    headers: authHeaders,
  });

  return response;
};

const useUpdateList = (listId: string) => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateListRequest) => updateList(listId, payload, authHeaders),
    onError: showErrorToast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId, authHeaders] });
      queryClient.invalidateQueries({ queryKey: ['list-timeline', listId, authHeaders] });
    },
  });
};

export default useUpdateList;
