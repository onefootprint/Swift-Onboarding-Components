import { useIntl } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import {
  DecisionAnnotation,
  GetPinnedAnnotationsRequest,
  GetPinnedAnnotationsResponse,
  PinnedAnnotation,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getPinnedAnnotations = async (
  { entityId }: GetPinnedAnnotationsRequest,
  authHeaders: AuthHeaders,
) => {
  const { data } = await request<GetPinnedAnnotationsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${entityId}/annotations`,
    params: {
      isPinned: true,
    },
  });

  return data;
};

const useEntityAnnotations = (id: string) => {
  const { authHeaders } = useSession();
  const { formatDateWithTime } = useIntl();

  return useQuery<PinnedAnnotation[]>(
    ['entity', id, 'annotations'],
    () => getPinnedAnnotations({ entityId: id }, authHeaders),
    {
      enabled: !!id,
      select: response =>
        response.map((annotation: DecisionAnnotation) => ({
          ...annotation,
          timestamp: formatDateWithTime(new Date(annotation.timestamp)),
        })),
    },
  );
};

export default useEntityAnnotations;
