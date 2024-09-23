import useEntityId from '@/entity/hooks/use-entity-id';
import request from '@onefootprint/request';
import type { RemoveTagRequest, RemoveTagResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const removeTag = async ({ id, tagId }: RemoveTagRequest, authHeaders: AuthHeaders) => {
  const response = await request<RemoveTagResponse>({
    headers: authHeaders,
    method: 'DELETE',
    url: `/entities/${id}/tags/${tagId}`,
  });
  return response.data;
};

const useRemoveTag = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();
  const entityId = useEntityId();

  return useMutation(({ id, tagId }: RemoveTagRequest) => removeTag({ id, tagId }, authHeaders), {
    onSuccess: () => {
      queryClient.invalidateQueries(['entities', entityId, 'tags', authHeaders]);
    },
  });
};

export default useRemoveTag;
