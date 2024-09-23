import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { CreateOrgTagRequest, CreateOrgTagResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const createOrgTag = async ({ kind, text }: CreateOrgTagRequest, authHeaders: AuthHeaders) => {
  const response = await request<CreateOrgTagResponse>({
    data: { kind, tag: text },
    headers: authHeaders,
    method: 'POST',
    url: '/org/tags',
  });
  return response.data;
};

const useCreateOrgTag = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation(({ kind, text }: CreateOrgTagRequest) => createOrgTag({ kind, text }, authHeaders), {
    onError: e => {
      showErrorToast(e);
      // Clear out all the results in case the request did create the tag
      queryClient.invalidateQueries(['org', 'tags', authHeaders]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['org', 'tags', authHeaders]);
    },
  });
};

export default useCreateOrgTag;
