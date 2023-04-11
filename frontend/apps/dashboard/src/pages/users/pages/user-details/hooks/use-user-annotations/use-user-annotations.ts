import { useIntl } from '@onefootprint/hooks';
import request, { RequestError } from '@onefootprint/request';
import {
  DecisionAnnotation,
  GetPinnedAnnotationsRequest,
  GetPinnedAnnotationsResponse,
  PinnedAnnotation,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getPinnedAnnotations = async (
  { entityId: userId }: GetPinnedAnnotationsRequest,
  authHeaders: AuthHeaders,
  dateFormatFn: (date: Date) => string,
) => {
  const response = await request<GetPinnedAnnotationsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${userId}/annotations`,
    params: {
      isPinned: true,
    },
  });

  return response.data.map((annotation: DecisionAnnotation) => ({
    ...annotation,
    timestamp: dateFormatFn(new Date(annotation.timestamp)),
  }));
};

const useUserAnnotations = (userId: string) => {
  const { authHeaders } = useSession();
  const { formatDateWithTime } = useIntl();

  return useQuery<PinnedAnnotation[], RequestError>(
    ['user', userId, 'annotations'],
    () =>
      getPinnedAnnotations(
        { entityId: userId },
        authHeaders,
        formatDateWithTime,
      ),
    {
      enabled: !!userId,
    },
  );
};

export default useUserAnnotations;
