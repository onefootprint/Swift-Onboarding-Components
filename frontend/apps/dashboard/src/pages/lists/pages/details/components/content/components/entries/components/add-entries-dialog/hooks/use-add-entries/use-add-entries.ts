import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { AddListEntriesRequest, AddListEntriesResponse, ListEntry } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const addEntries = async (authHeaders: AuthHeaders, data: AddListEntriesRequest) => {
  const { listId, entries } = data;
  const response = await request<AddListEntriesResponse>({
    data: { entries },
    headers: authHeaders,
    method: 'POST',
    url: `/org/lists/${listId}/entries`,
  });
  return response.data;
};

const useAddEntries = (listId: string = '') => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddListEntriesRequest) => addEntries(authHeaders, data),
    onError: (error: Error) => {
      showErrorToast(error);
      // Clear out all the results in case the request did create the list
      queryClient.invalidateQueries({ queryKey: ['list-entries', listId, authHeaders] });
    },
    onSuccess: (response: AddListEntriesResponse) => {
      // Insert the newly created list into the top of the returned entries list. This nicely
      // helps to show the most recent value as soon as it is created
      queryClient.invalidateQueries({ queryKey: ['list-timeline', listId, authHeaders] });
      queryClient.setQueryData(['list-entries', listId, authHeaders], (prevList?: ListEntry[]) =>
        (response || []).concat(prevList || []),
      );
    },
  });
};

export default useAddEntries;
