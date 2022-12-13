import request, {
  PaginatedRequestResponse,
  RequestError,
} from '@onefootprint/request';
import { OnboardingStatus, ScopedUser } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import omit from 'lodash/omit';
import useSession, { AuthHeaders } from 'src/hooks/use-session';
import { User } from 'src/hooks/use-user-store/user-store.types';
import useUserFilters, {
  getCursors,
  ScopedUsersListQueryString,
} from 'src/pages/users/hooks/use-users-filters';
import { dateRangeToFilterParams } from 'src/utils/date-range';

type MetadataPageResponse = ScopedUser[];

type GetMetadataPageRequest = {
  authHeaders: AuthHeaders;
  pageSize: number;
  params: ScopedUsersListQueryString;
};

const getMetadataPageRequest = async ({
  params,
  authHeaders,
  pageSize,
}: GetMetadataPageRequest) => {
  const dateRangeFilters = dateRangeToFilterParams(params);

  // cursors is a stack of cursors for all pages visited. Use the cursor on the top of the stack
  // (the current page) when asking the backend for results
  const cursors = getCursors(params);
  const req = {
    ...omit(params, 'cursors', 'dateRange'),
    ...dateRangeFilters,
    cursor: cursors[cursors.length - 1],
    pageSize,
  };
  const { data: response } = await request<
    PaginatedRequestResponse<MetadataPageResponse>
  >({
    method: 'GET',
    url: '/users',
    params: req,
    headers: authHeaders,
  });

  return response;
};

const useGetMetadataPage = (
  pageSize: number,
  options?: {
    onSuccess?: (data: PaginatedRequestResponse<User>) => void;
    onError?: (error: RequestError) => void;
  },
) => {
  const { authHeaders } = useSession();
  const { filters } = useUserFilters();

  const params: Record<string, any> = {};
  if (filters.statuses) {
    params.statuses = filters.statuses;
  }
  if (filters.dateRange) {
    params.dateRange = filters.dateRange;
  }
  if (filters.fingerprint) {
    params.fingerprint = filters.fingerprint;
  }

  return useQuery(
    ['get-metadata-page', params, authHeaders, pageSize],
    () => getMetadataPageRequest({ pageSize, authHeaders, params }),
    {
      enabled: !!pageSize,
      retry: false,
      onError: options?.onError,
      select: response => ({
        meta: response.meta,
        data: response.data.map((metadata: ScopedUser) => ({
          metadata: {
            ...metadata,
            requiresManualReview:
              metadata.onboarding?.requiresManualReview || false,
            status: metadata.onboarding?.status || OnboardingStatus.vaultOnly,
          },
          vaultData: undefined,
        })),
      }),
    },
  );
};

export default useGetMetadataPage;
