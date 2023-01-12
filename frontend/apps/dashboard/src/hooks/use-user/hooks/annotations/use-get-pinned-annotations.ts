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
import useUserStore from 'src/hooks/use-user-store';

const getPinnedAnnotations = async (
  { authHeaders, userId }: GetPinnedAnnotationsRequest,
  dateFormatFn: (date: Date) => string,
) => {
  const response = await request<GetPinnedAnnotationsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/users/${userId}/annotations`,
    params: {
      isPinned: true,
    },
  });

  return response.data.map((annotation: DecisionAnnotation) => ({
    ...annotation,
    timestamp: dateFormatFn(new Date(annotation.timestamp)),
  }));
};

const useGetPinnedAnnotations = (userId: string) => {
  const userStore = useUserStore();
  const { authHeaders } = useSession();
  const { formatDateWithTime } = useIntl();

  return useQuery<PinnedAnnotation[], RequestError>(
    ['get-pinned-annotations', authHeaders, userId],
    () => getPinnedAnnotations({ authHeaders, userId }, formatDateWithTime),
    {
      enabled: !!userId,
      onSuccess(data) {
        userStore.merge({
          userId,
          data: {
            annotations: {
              entries: data,
            },
          },
        });
      },
    },
  );
};

export default useGetPinnedAnnotations;
