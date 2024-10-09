import request from '@onefootprint/request';
import type { AddTagRequest, AddTagResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const addTag = async ({ entityId, text }: AddTagRequest, authHeaders: AuthHeaders) => {
  const response = await request<AddTagResponse>({
    data: { tag: text },
    headers: authHeaders,
    method: 'POST',
    url: `/entities/${entityId}/tags`,
  });
  return response.data;
};

const useEntityAddTag = () => {
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: ({ entityId, text }: AddTagRequest) => addTag({ entityId, text }, authHeaders),
  });
};

export default useEntityAddTag;
