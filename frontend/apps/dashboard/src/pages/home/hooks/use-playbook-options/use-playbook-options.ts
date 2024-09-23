import type { PaginatedRequestResponse } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetOnboardingConfigsResponse, OnboardingConfigKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useFilters from '../use-filters';

type GetPlaybooksRequest = {
  authHeaders: AuthHeaders;
  kinds?: OnboardingConfigKind[];
};

const getPlaybooks = async ({ authHeaders, kinds }: GetPlaybooksRequest) => {
  const params = { kinds: kinds?.join(','), page_size: 100 };
  const { data: response } = await request<PaginatedRequestResponse<GetOnboardingConfigsResponse>>({
    method: 'GET',
    url: '/org/onboarding_configs',
    headers: authHeaders,
    params,
  });

  return response;
};

type UsePlaybookOptionsArgs = {
  kinds?: OnboardingConfigKind[];
};

const usePlaybookOptions = ({ kinds }: UsePlaybookOptionsArgs) => {
  const { authHeaders, isLive } = useSession();
  const { isReady } = useFilters();

  return useQuery({
    queryKey: ['insights', 'playbooks', isLive],
    queryFn: () => getPlaybooks({ authHeaders, kinds }),
    enabled: isReady,
    select: response =>
      response.data?.map(({ id, name }) => ({
        label: name,
        value: id,
      })) || [],
  });
};

export default usePlaybookOptions;
