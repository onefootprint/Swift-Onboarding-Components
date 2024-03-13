import { useObserveCollector } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import React from 'react';

import { InitShimmer } from '../../components';
import type { DeviceInfo } from '../../hooks';
import { useDeviceInfo, useGetOnboardingConfig } from '../../hooks';
import useIdvMachine from '../../hooks/ui/use-idv-machine';
import { Logger } from '../../utils';

const Init = () => {
  const [state, send] = useIdvMachine();
  const { obConfigAuth, authToken, device } = state.context;
  const observeCollector = useObserveCollector();

  useDeviceInfo((newDevice: DeviceInfo) => {
    observeCollector.setAppContext({
      device: newDevice,
    });
    send({
      type: 'initContextUpdated',
      payload: {
        device: device ?? newDevice,
      },
    });
  });

  useGetOnboardingConfig(
    { obConfigAuth, authToken },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
        observeCollector.setAppContext({
          config,
        });
        send({
          type: 'initContextUpdated',
          payload: {
            config,
          },
        });
      },
      onError: error => {
        Logger.error(
          `Fetching onboarding config in IDV init page failed: ${getErrorMessage(
            error,
          )}`,
          'idv-init',
        );
        send({
          type: 'configRequestFailed',
        });
      },
    },
  );

  return <InitShimmer />;
};

export default Init;
