import { useGetOnboardingConfig } from '@onefootprint/footprint-elements';
import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import { CollectedKycDataOptionLabels } from '@onefootprint/types';
import React from 'react';
import InitShimmer from 'src/components/init-shimmer';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { Events } from 'src/utils/state-machine/bifrost';

import useBootstrapData from './hooks/use-bootstrap-data';
import useTenantPublicKey from './hooks/use-tenant-public-key';

const Init = () => {
  const tenantPk = useTenantPublicKey();
  const [, send] = useBifrostMachine();

  useDeviceInfo((device: DeviceInfo) => {
    send({
      type: Events.initContextUpdated,
      payload: {
        device,
      },
    });
  });

  useGetOnboardingConfig(tenantPk, {
    onSuccess: ({ orgName, name, isLive, mustCollectData, canAccessData }) => {
      send({
        type: Events.initContextUpdated,
        payload: {
          tenant: {
            pk: tenantPk,
            orgName,
            name,
            isLive,
            mustCollectData: mustCollectData.map(
              (attr: string) => CollectedKycDataOptionLabels[attr],
            ),
            canAccessData: canAccessData.map(
              (attr: string) => CollectedKycDataOptionLabels[attr],
            ),
          },
        },
      });
    },
    onError: () => {
      send({
        type: Events.tenantInfoRequestFailed,
      });
    },
  });

  useBootstrapData(bootstrapData => {
    send({
      type: Events.initContextUpdated,
      payload: {
        bootstrapData,
      },
    });
  });

  return <InitShimmer />;
};

export default Init;
