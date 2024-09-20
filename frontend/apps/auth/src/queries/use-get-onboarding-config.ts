import request from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';

import type { PublicOnboardingConfig } from '@onefootprint/types';

const getOnboardingConfig = async (key: string) => {
  const headers: Record<string, string> = { 'x-onboarding-config-key': key };
  const { data: response } = await request<PublicOnboardingConfig>({
    method: 'GET',
    url: '/hosted/onboarding/config',
    headers,
  });

  return response;
};

const useGetOnboardingConfig = (key: string) =>
  useQuery({
    queryKey: [key, 'get-hosted-onboarding-config'],
    queryFn: () => getOnboardingConfig(key),
    enabled: !!key,
  });

export default useGetOnboardingConfig;
