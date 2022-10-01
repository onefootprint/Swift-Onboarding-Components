import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useBiometricMachine from 'src/hooks/use-d2p-mobile-machine';
import { Events } from 'src/utils/state-machine';

import useAuthToken from './hooks/use-auth-token';

const Init = () => {
  const [, send] = useBiometricMachine();
  useAuthToken();
  useDeviceInfo((info: DeviceInfo) => {
    send({
      type: Events.deviceInfoIdentified,
      payload: info,
    });
  });
  return <LoadingIndicator />;
};

export default Init;
