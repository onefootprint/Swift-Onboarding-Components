import { useIntl } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { Annotation, GetPinnedAnnotationsRequest, GetPinnedAnnotationsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getPinnedAnnotations = async ({ entityId }: GetPinnedAnnotationsRequest, authHeaders: AuthHeaders) => {
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

  return useQuery({
    queryKey: ['entity', id, 'annotations', authHeaders],
    queryFn: () => getPinnedAnnotations({ entityId: id }, authHeaders),
    enabled: !!id,
    select: (response: Annotation[]) =>
      response.map((annotation: Annotation) => ({
        ...annotation,
        timestamp: formatDateWithTime(new Date(annotation.timestamp)),
      })),
  });
};

export default useEntityAnnotations;
