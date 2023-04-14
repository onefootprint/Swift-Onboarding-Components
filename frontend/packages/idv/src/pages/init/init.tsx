import { useObserveCollector } from '@onefootprint/dev-tools';
import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import {
  CollectedDataOptionLabels,
  OnboardingConfig,
} from '@onefootprint/types';
import React from 'react';

import InitShimmer from '../../components/init-shimmer';
import useIdvMachine from '../../hooks/use-idv-machine';
import useGetOnboardingConfig from './hooks/use-get-onboarding-config';

const Init = () => {
  const [state, send] = useIdvMachine();
  const { tenantPk } = state.context;
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

  return <InitShimmer />;
};

export default Init;
