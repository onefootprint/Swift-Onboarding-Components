import { getErrorMessage } from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import React, { useEffect } from 'react';

import { InitShimmer } from '../../components';
import type { DeviceInfo } from '../../hooks';
import { useDeviceInfo, useGetOnboardingConfig } from '../../hooks';
import useIdvMachine from '../../hooks/ui/use-idv-machine';
import { Logger, trackAction } from '../../utils';

const Init = () => {
  const [state, send] = useIdvMachine();
  const { obConfigAuth, authToken, device, userData = {} } = state.context;

  useDeviceInfo((newDevice: DeviceInfo) => {
    send({
      type: 'initContextUpdated',
      payload: {
        device: device ?? newDevice,
      },
    });
  });

  useEffect(() => {
    trackAction('onboarding:started', {
      hasBootstrapData: Object.entries(userData).some(([, value]) => value),
    });
    // TODO: Deprecate this action
    trackAction('idv:started');
  }, []);

  useGetOnboardingConfig(
    { obConfigAuth, authToken },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
        send({
          type: 'initContextUpdated',
          payload: {
            config,
          },
        });
      },
      onError: error => {
        trackAction('onboarding:started-failed', { error: getErrorMessage(error) });
        Logger.error(`Fetching onboarding config in IDV init page failed: ${getErrorMessage(error)}`, {
          location: 'idv-init',
        });
        send({
          type: 'configRequestFailed',
        });
      },
    },
  );

  return <InitShimmer />;
};

export default Init;
