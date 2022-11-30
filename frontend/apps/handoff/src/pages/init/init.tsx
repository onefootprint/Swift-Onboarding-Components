import {
  HandoffUrlQuery,
  useGetOnboardingConfig,
  useParseHandoffUrl,
  useUpdateD2PStatus,
} from '@onefootprint/footprint-elements';
import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import {
  CollectedKycDataOptionLabels,
  D2PStatusUpdate,
  GetOnboardingConfigResponse,
  TenantInfo,
} from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

const Init = () => {
  const [state, send] = useHandoffMachine();
  const { tenantPk: pk } = state.context;
  const updateD2PStatusMutation = useUpdateD2PStatus();

  useParseHandoffUrl({
    onSuccess: (query: HandoffUrlQuery) => {
      const { authToken, tenantPk } = query;
      // Tell the api that d2p is in progress now
      updateD2PStatusMutation.mutate(
        {
          authToken,
          status: D2PStatusUpdate.inProgress,
        },
        {
          onError() {
            // If the handoff was already completed, we will get an error about
            // trying to transition the status backwards
            send({
              type: Events.d2pAlreadyCompleted,
            });
          },
          onSettled() {
            send({
              type: Events.initContextUpdated,
              payload: {
                authToken,
                tenantPk,
              },
            });
          },
        },
      );
    },
  });

  useGetOnboardingConfig(pk ?? '', {
    onSuccess: (data: GetOnboardingConfigResponse) => {
      const { orgName, name, isLive, mustCollectData, canAccessData } = data;
      const tenant: TenantInfo = {
        pk: pk ?? '',
        orgName,
        name,
        isLive,
        mustCollectData: mustCollectData.map(
          (attr: string) => CollectedKycDataOptionLabels[attr],
        ),
        canAccessData: canAccessData.map(
          (attr: string) => CollectedKycDataOptionLabels[attr],
        ),
      };

      send({
        type: Events.initContextUpdated,
        payload: {
          tenant,
        },
      });
    },
  });

  useDeviceInfo((device: DeviceInfo) => {
    send({
      type: Events.initContextUpdated,
      payload: {
        device,
      },
    });
  });

  return <LoadingIndicator />;
};

export default Init;
