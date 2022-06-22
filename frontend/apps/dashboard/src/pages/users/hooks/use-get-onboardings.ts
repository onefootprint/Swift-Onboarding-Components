import { omit } from 'lodash';
import { QueryFunctionContext, QueryKey, useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import {
  getCursors,
  getDateRange,
  OnboardingListQuerystring,
  useFilters,
} from 'src/pages/users/hooks/use-filters';
import { dateRangeToFilterParams, Onboarding } from 'src/types';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

type OnboardingsListQueryKey = [
  string,
  OnboardingListQuerystring,
  string,
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
  const [, params, auth, pageSize] = queryKey as OnboardingsListQueryKey;
  const dateRangeFilters = dateRangeToFilterParams(getDateRange(params));
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
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth as string },
  });
  return response;
};

const useGetOnboardings = (pageSize: number) => {
  const session = useSessionUser();
  const auth = session.data?.auth;
  const { query } = useFilters();

  return useQuery<OnboardingsListResponse, RequestError>(
    ['paginatedOnboardings', query, auth, pageSize],
    getOnboardingsRequest,
    {
      retry: false,
    },
  );
};

export default useGetOnboardings;
