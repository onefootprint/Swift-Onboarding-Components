import { useObserveCollector } from '@onefootprint/dev-tools';
import { PublicOnboardingConfig } from '@onefootprint/types';
import React from 'react';

import InitShimmer from '../../../../components/init-shimmer';
import useGetOnboardingConfig from '../../../../hooks/api/org/get-onboarding-config';
import useDeviceInfo, {
  DeviceInfo,
} from '../../../../hooks/ui/use-device-info';
import { useIdentifyMachine } from '../../components/identify-machine-provider';

const Init = () => {
  const [state, send] = useIdentifyMachine();
  const { obConfigAuth } = state.context;
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
    { obConfigAuth },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
        observeCollector.setAppContext({
          config,
        });
        send({
          type: 'initContextUpdated',
          payload: {
            config: { ...config },
          },
        });
      },
      onError: () => {
        send({
          type: 'configRequestFailed',
        });
      },
    },
  );

  return <InitShimmer />;
};

export default Init;
