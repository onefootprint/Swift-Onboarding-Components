import { useRequestErrorToast } from '@onefootprint/hooks';
import request, { RequestError } from '@onefootprint/request';
import {
  UpdateAnnotationRequest,
  UpdateAnnotationResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

const updateOnboardingConfig = async (
  authHeaders: AuthHeaders,
  data: UpdateAnnotationRequest,
  userId: string,
) => {
  const { annotationId, isPinned } = data;
  const response = await request<UpdateAnnotationResponse>({
    headers: authHeaders,
    method: 'PATCH',
    url: `/users/${userId}/annotations/${annotationId}`,
    data: {
      isPinned,
    },
  });
  return response.data;
};

const useUpdateAnnotation = () => {
  const { authHeaders } = useSession();
  const showErrorToast = useRequestErrorToast();
  const userId = useUserId();

  return useMutation<
    UpdateAnnotationResponse,
    RequestError,
    UpdateAnnotationRequest
  >(
    (updateAnnotationRequest: UpdateAnnotationRequest) =>
      updateOnboardingConfig(authHeaders, updateAnnotationRequest, userId),
    {
      onError: err => {
        showErrorToast(err);
      },
    },
  );
};

export default useUpdateAnnotation;
