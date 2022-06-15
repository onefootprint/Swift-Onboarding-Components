import { useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import {
  OnboardingsListRequest,
  useFilters,
} from 'src/pages/users/hooks/use-filters';
import { Onboarding } from 'src/types';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

// TODO pagination
const getOnboardingsRequest = async (
  params: OnboardingsListRequest,
  auth: string | undefined,
) => {
  const { data: response } = await request<RequestResponse<Onboarding[]>>({
    method: 'GET',
    url: '/org/onboardings',
    params,
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth as string },
  });
  return response.data;
};

const useGetOnboardings = () => {
  const session = useSessionUser();
  const auth = session.data?.auth;

  const { query } = useFilters();
  return useQuery<Onboarding[], RequestError>(
    ['paginatedOnboardings', query, auth],
    () => getOnboardingsRequest(query, auth),
    {
      retry: false,
    },
  );
};

export default useGetOnboardings;
