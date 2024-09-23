import request from '@onefootprint/request';
import type { DeleteListEntryRequest } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const deleteListEntry = async (listId: string, entryId: string, authHeaders: AuthHeaders) => {
  const response = await request({
    method: 'DELETE',
    url: `/org/lists/${listId}/entries/${entryId}`,
    headers: authHeaders,
  });

  return response;
};

const useDeleteListEntry = (listId: string) => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId }: DeleteListEntryRequest) => deleteListEntry(listId, entryId, authHeaders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-timeline', listId, authHeaders] });
      queryClient.invalidateQueries({ queryKey: ['list-entries', listId, authHeaders] });
    },
  });
};

export default useDeleteListEntry;
