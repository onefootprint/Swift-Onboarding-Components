import { useObserveCollector } from '@onefootprint/dev-tools';
import { useGetOnboardingConfig } from '@onefootprint/footprint-elements';
import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import {
  CollectedDataOptionLabels,
  OnboardingConfig,
} from '@onefootprint/types';
import React from 'react';
import InitShimmer from 'src/components/init-shimmer';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import useBootstrapData from './hooks/use-bootstrap-data';
import useTenantPublicKey from './hooks/use-tenant-public-key';

const Init = () => {
  const tenantPk = useTenantPublicKey();
  const [, send] = useBifrostMachine();
  const observeCollector = useObserveCollector();

  useDeviceInfo((device: DeviceInfo) => {
    observeCollector.setAppContext({
      device,
    });
    send({
      type: 'initContextUpdated',
      payload: {
        device,
      },
    });
  });

  useGetOnboardingConfig(tenantPk, {
    onSuccess: (config: OnboardingConfig) => {
      observeCollector.setAppContext({
        config,
      });
      send({
        type: 'initContextUpdated',
        payload: {
          config: {
            ...config,
            mustCollectData: config.mustCollectData.map(
              (attr: string) => CollectedDataOptionLabels[attr],
            ),
            canAccessData: config.canAccessData.map(
              (attr: string) => CollectedDataOptionLabels[attr],
            ),
          },
        },
      });
    },
    onError: () => {
      send({
        type: 'configRequestFailed',
      });
    },
  });

  useBootstrapData(bootstrapData => {
    observeCollector.setAppContext({
      bootstrap: {
        email: !!bootstrapData?.email,
        phoneNumber: !!bootstrapData?.phoneNumber,
      },
    });
    send({
      type: 'initContextUpdated',
      payload: {
        bootstrapData,
      },
    });
  });

  return <InitShimmer />;
};

export default Init;
