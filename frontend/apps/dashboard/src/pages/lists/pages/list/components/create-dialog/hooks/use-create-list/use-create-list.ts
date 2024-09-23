import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { CreateListRequest, CreateListResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const createList = async (authHeaders: AuthHeaders, data: CreateListRequest) => {
  const response = await request<CreateListResponse>({
    data,
    headers: authHeaders,
    method: 'POST',
    url: '/org/lists',
  });
  return response.data;
};

const useCreateList = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListRequest) => createList(authHeaders, data),
    onError: (error: Error) => {
      showErrorToast(error);
      // Clear out all the results in case the request did create the list
      queryClient.invalidateQueries({ queryKey: ['lists', authHeaders] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', authHeaders] });
    },
  });
};

export default useCreateList;
