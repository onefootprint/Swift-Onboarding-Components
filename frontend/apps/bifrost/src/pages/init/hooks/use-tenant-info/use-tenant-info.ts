import {
  CollectedDataOptionLabels,
  OnboardingConfig,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { CLIENT_PUBLIC_KEY_HEADER } from 'src/config/constants';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { Events } from 'src/utils/state-machine/bifrost';

type TenantInfoRequest = {
  tenantPk: string;
};

type TenantInfoResponse = OnboardingConfig;

const getTenantInfo = async (payload: TenantInfoRequest) => {
  const response = await request<TenantInfoResponse>({
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

  useQuery<TenantInfoResponse, RequestError>(
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
