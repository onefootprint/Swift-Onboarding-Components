import request from '@onefootprint/request';
import type { RemoveTagRequest, RemoveTagResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const removeTag = async ({ entityId, tagId }: RemoveTagRequest, authHeaders: AuthHeaders) => {
  const response = await request<RemoveTagResponse>({
    headers: authHeaders,
    method: 'DELETE',
    url: `/entities/${entityId}/tags/${tagId}`,
  });
  return response.data;
};

const useEntityRemoveTag = () => {
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: ({ entityId, tagId }: RemoveTagRequest) => removeTag({ entityId, tagId }, authHeaders),
  });
};

export default useEntityRemoveTag;
