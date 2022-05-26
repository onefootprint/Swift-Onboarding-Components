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
const getOnboardingsRequest = async (query: OnboardingsListRequest) => {
  const { data: response } = await request<RequestResponse<Onboarding[]>>({
    method: 'GET',
    url: `http://localhost:8000/org/onboardings`,
    params: query,
    headers: { 'x-client-secret-key': 'sk_hsSPWQe1TjZ9k9fWZbuOva0AZ7MHVfpscJ' },
  });
  return response.data;
};

const useGetOnboardings = () => {
  const { query } = useFilters();

  return useQuery<Onboarding[], RequestError>(
    ['paginatedOnboardings', query],
    () => getOnboardingsRequest(query),
    {
      retry: false,
    },
  );
};

export default useGetOnboardings;
