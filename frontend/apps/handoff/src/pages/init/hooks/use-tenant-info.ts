import request, { RequestError } from '@onefootprint/request';
import {
  CollectedDataOptionLabels,
  GetOnboardingConfigRequest,
  GetOnboardingConfigResponse,
  TenantInfo,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { CLIENT_PUBLIC_KEY_HEADER } from 'src/config/constants';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

const getTenantInfo = async (payload: GetOnboardingConfigRequest) => {
  const response = await request<GetOnboardingConfigResponse>({
    method: 'GET',
    url: '/org/onboarding_config',
    headers: {
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useTenantInfo = (
  options: {
    onSuccess?: (response: TenantInfo) => void;
    onError?: () => void;
  } = {},
) => {
  const [state] = useHandoffMachine();
  const { tenantPk } = state.context;

  useQuery<GetOnboardingConfigResponse, RequestError>(
    ['tenantInfo', tenantPk],
    () => getTenantInfo({ tenantPk: tenantPk ?? '' }),
    {
      enabled: !!tenantPk,
      onSuccess: ({
        orgName,
        name,
        isLive,
        mustCollectData,
        canAccessData,
      }) => {
        options.onSuccess?.({
          pk: tenantPk ?? '',
          orgName,
          name,
          isLive,
          mustCollectData: mustCollectData.map(
            (attr: string) => CollectedDataOptionLabels[attr],
          ),
          canAccessData: canAccessData.map(
            (attr: string) => CollectedDataOptionLabels[attr],
          ),
        });
      },
      onError: () => {
        options.onError?.();
      },
    },
  );
};

export default useTenantInfo;
