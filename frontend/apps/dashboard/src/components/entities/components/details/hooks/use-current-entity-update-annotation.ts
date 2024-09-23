import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { UpdateAnnotationRequest, UpdateAnnotationResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useEntityId from './use-entity-id';

const updateAnnotation = async (authHeaders: AuthHeaders, payload: UpdateAnnotationRequest, id: string) => {
  const { annotationId, isPinned } = payload;
  const response = await request<UpdateAnnotationResponse>({
    headers: authHeaders,
    method: 'PATCH',
    url: `/entities/${id}/annotations/${annotationId}`,
    data: {
      isPinned,
    },
  });

  return response.data;
};

const useCurrentEntityUpdateAnnotation = () => {
  const queryClient = useQueryClient();
  const { authHeaders } = useSession();
  const showErrorToast = useRequestErrorToast();
  const id = useEntityId();

  return useMutation(
    (updateAnnotationRequest: UpdateAnnotationRequest) => updateAnnotation(authHeaders, updateAnnotationRequest, id),
    {
      onSuccess: () => {
        queryClient.refetchQueries();
      },
      onError: (error: unknown) => {
        showErrorToast(error);
      },
    },
  );
};

export default useCurrentEntityUpdateAnnotation;
