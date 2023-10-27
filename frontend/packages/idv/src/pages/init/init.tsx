import { useObserveCollector } from '@onefootprint/dev-tools';
import type { DeviceInfo } from '@onefootprint/idv-elements';
import {
  InitShimmer,
  Logger,
  useDeviceInfo,
  useGetOnboardingConfig,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import React from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';

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
