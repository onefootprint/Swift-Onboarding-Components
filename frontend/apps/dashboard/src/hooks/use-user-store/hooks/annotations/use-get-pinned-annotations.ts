import { useIntl } from '@onefootprint/hooks';
import request, { RequestError } from '@onefootprint/request';
import {
  DecisionAnnotation,
  GetPinnedAnnotationsRequest,
  GetPinnedAnnotationsResponse,
  PinnedAnnotation,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';
import { parseAnnotationNote } from 'src/pages/users/pages/user-details/components/user-detail-data/utils/annotation-note-utils';

const getPinnedAnnotations = async ({
  authHeaders,
  userId,
}: GetPinnedAnnotationsRequest) => {
  const response = await request<GetPinnedAnnotationsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/users/${userId}/annotations`,
    params: {
      isPinned: true,
    },
  });

  return response.data.map((annotation: DecisionAnnotation) => {
    const { reason, note } = parseAnnotationNote(annotation.note);
    return {
      ...annotation,
      reason,
      note,
    };
  });
};

const useGetPinnedAnnotations = (userId: string) => {
  const { authHeaders } = useSession();
  const { formatDateWithTime } = useIntl();

  return useQuery<PinnedAnnotation[], RequestError>(
    ['get-pinned-annotations', authHeaders, userId],
    () => getPinnedAnnotations({ authHeaders, userId }),
    {
      enabled: !!userId,
      select: response =>
        response.map(annotation => ({
          ...annotation,
          timestamp: formatDateWithTime(new Date(annotation.timestamp)),
        })),
    },
  );
};

export default useGetPinnedAnnotations;
