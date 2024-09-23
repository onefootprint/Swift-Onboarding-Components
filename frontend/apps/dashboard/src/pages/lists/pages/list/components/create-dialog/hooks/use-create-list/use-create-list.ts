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

  return useMutation((data: CreateListRequest) => createList(authHeaders, data), {
    onError: e => {
      showErrorToast(e);
      // Clear out all the results in case the request did create the list
      queryClient.invalidateQueries(['lists', authHeaders]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lists', authHeaders]);
    },
  });
};

export default useCreateList;
