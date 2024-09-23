import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const deleteList = async (listId: string, authHeaders: AuthHeaders) => {
  const response = await request({
    method: 'DELETE',
    url: `/org/lists/${listId}`,
    headers: authHeaders,
  });

  return response;
};

const useDeleteList = (listId: string) => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation(() => deleteList(listId, authHeaders), {
    onError: showErrorToast,
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', authHeaders]);
    },
  });
};

export default useDeleteList;
