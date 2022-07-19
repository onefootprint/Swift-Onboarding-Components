import { omit } from 'lodash';
import { QueryFunctionContext, QueryKey, useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import {
  getCursors,
  OnboardingListQuerystring,
  useFilters,
} from 'src/pages/users/hooks/use-filters';
import { dateRangeToFilterParams, Onboarding } from 'src/types';

type OnboardingsListQueryKey = [
  string,
  OnboardingListQuerystring,
  AuthHeaders,
  number,
];

type OnboardingsListResponse = {
  data: Onboarding[];
  next?: string;
  count?: number;
};

const getOnboardingsRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, authHeaders, pageSize] = queryKey as OnboardingsListQueryKey;
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
  const { data: response } = await request<RequestResponse<Onboarding[]>>({
    method: 'GET',
    url: '/org/onboardings',
    params: req,
    headers: authHeaders,
  });
  return response;
};

const useGetOnboardings = (pageSize: number) => {
  const { authHeaders } = useSessionUser();
  const { filters } = useFilters();

  return useQuery<OnboardingsListResponse, RequestError>(
    ['paginatedOnboardings', filters, authHeaders, pageSize],
    getOnboardingsRequest,
    {
      retry: false,
    },
  );
};

export default useGetOnboardings;
