import { omit } from 'lodash';
import { QueryFunctionContext, QueryKey, useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import {
  OnboardingListFilters,
  useFilters,
} from 'src/pages/users/hooks/use-filters';
import { Onboarding } from 'src/types';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

type OnboardingsListQueryKey = [string, OnboardingListFilters, string];

type OnboardingsListResponse = {
  data: Onboarding[];
  next?: string;
  prev?: string;
};

const getOnboardingsRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, auth] = queryKey as OnboardingsListQueryKey;

  // cursors is a stack of cursors for all pages visited. Use the cursor on the top of the stack
  // (the current page) when asking the backend for results
  const currentCursors = JSON.parse(params.cursors || '[]');
  const cursor = currentCursors
    ? currentCursors[currentCursors.length - 1]
    : undefined;

  const req = {
    ...omit(params, 'cursors'),
    cursor,
    pageSize: 5, // TODO
  };
  const { data: response } = await request<RequestResponse<Onboarding[]>>({
    method: 'GET',
    url: '/org/onboardings',
    params: req,
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth as string },
  });
  return response;
};

const useGetOnboardings = () => {
  const session = useSessionUser();
  const auth = session.data?.auth;
  const { query } = useFilters();

  return useQuery<OnboardingsListResponse, RequestError>(
    ['paginatedOnboardings', query, auth],
    getOnboardingsRequest,
    {
      retry: false,
    },
  );
};

export default useGetOnboardings;
