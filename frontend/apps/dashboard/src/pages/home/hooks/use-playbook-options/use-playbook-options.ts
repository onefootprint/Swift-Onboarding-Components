import { useTranslation } from '@onefootprint/hooks';
import type { PaginatedRequestResponse } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetOnboardingConfigsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import ALL_PLAYBOOKS_ID from '../../constants';
import useFilters from '../use-filters';

const getPlaybooks = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetOnboardingConfigsResponse>
  >({
    method: 'GET',
    url: '/org/onboarding_configs',
    headers: authHeaders,
    params: {
      page_size: 10000,
    },
  });

  return response;
};

const usePlaybookOptions = () => {
  const { authHeaders, isLive } = useSession();
  const { isReady } = useFilters();
  const { t } = useTranslation('pages.home.onboarding-metrics.filters');

  return useQuery(
    ['insights', 'playbooks', isLive],
    () => getPlaybooks(authHeaders),
    {
      enabled: isReady,
      select: response => {
        const allPlaybooksOption = {
          label: t('all-playbooks'),
          value: ALL_PLAYBOOKS_ID,
        };

        return [
          allPlaybooksOption,
          ...(response.data?.map(({ id, name }) => ({
            label: name,
            value: id,
          })) || []),
        ];
      },
    },
  );
};

export default usePlaybookOptions;
