import useSessionUser from '@src/hooks/use-session-user';
import { useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import {
  OnboardingsListRequest,
  useFilters,
} from 'src/pages/users/hooks/use-filters';

export enum OnboardingStatus {
  verified = 'verified',
  manualReview = 'manual_review',
  processing = 'processing',
  incomplete = 'incomplete',
  failed = 'failed',
}

export type Onboarding = {
  footprintUserId: string;
  status: OnboardingStatus;
  createdAt: string; // TODO rename this initiatedAt
  updatedAt: string;
};

// TODO pagination
const getOnboardingsRequest = async (
  { status, fingerprint }: OnboardingsListRequest,
  auth: string | undefined,
) => {
  const { data: response } = await request<RequestResponse<Onboarding[]>>({
    method: 'GET',
    url: '/org/onboardings',
    params: { status, fingerprint },
    headers: { 'x-fp-dashboard-authorization': auth as string },
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
