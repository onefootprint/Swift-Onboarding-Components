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
  const { obConfigAuth, authToken } = state.context;
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

  useGetOnboardingConfig(
    { obConfigAuth, authToken },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
        observeCollector.setAppContext({
          config,
        });
        Logger.info(
          `Using new identify machine: ${!!config.useNewIdentifyMachine}`,
        );
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
