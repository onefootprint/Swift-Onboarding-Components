import useEntityId from '@/entity/hooks/use-entity-id';
import request from '@onefootprint/request';
import type { AddTagRequest, AddTagResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const addTag = async ({ id, text }: AddTagRequest, authHeaders: AuthHeaders) => {
  const response = await request<AddTagResponse>({
    data: { tag: text },
    headers: authHeaders,
    method: 'POST',
    url: `/entities/${id}/tags`,
  });
  return response.data;
};

const useAddTag = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();
  const entityId = useEntityId();

  return useMutation({
    mutationFn: ({ id, text }: AddTagRequest) => addTag({ id, text }, authHeaders),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entities', entityId, 'tags', authHeaders],
      });
    },
  });
};

export default useAddTag;
