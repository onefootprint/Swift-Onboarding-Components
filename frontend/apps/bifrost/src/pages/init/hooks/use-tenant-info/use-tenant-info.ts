import request, { RequestError } from '@onefootprint/request';
import {
  CollectedDataOptionLabels,
  GetOnboardingConfigRequest,
  GetOnboardingConfigResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { CLIENT_PUBLIC_KEY_HEADER } from 'src/config/constants';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { Events } from 'src/utils/state-machine/bifrost';

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

const useTenantInfo = (tenantPk: string) => {
  const [, send] = useBifrostMachine();

  useQuery<GetOnboardingConfigResponse, RequestError>(
    ['tenantInfo', tenantPk],
    () => getTenantInfo({ tenantPk }),
    {
      enabled: !!tenantPk,
      onSuccess: ({
        orgName,
        name,
        isLive,
        mustCollectData,
        canAccessData,
      }) => {
        send({
          type: Events.tenantInfoRequestSucceeded,
          payload: {
            pk: tenantPk,
            orgName,
            name,
            isLive,
            mustCollectData: mustCollectData.map(
              (attr: string) => CollectedDataOptionLabels[attr],
            ),
            canAccessData: canAccessData.map(
              (attr: string) => CollectedDataOptionLabels[attr],
            ),
          },
        });
      },
      onError: () => {
        send({
          type: Events.tenantInfoRequestFailed,
        });
      },
    },
  );
};

export default useTenantInfo;
