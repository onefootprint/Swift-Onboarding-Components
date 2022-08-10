import { DeviceInfo, useDeviceInfo } from 'hooks';
import React from 'react';
import useD2PMobileMachine from 'src/hooks/use-d2p-mobile-machine';
import { Events } from 'src/utils/state-machine';
import { LoadingIndicator } from 'ui';

import useAuthToken from './hooks/use-auth-token';

const Init = () => {
  const [, send] = useD2PMobileMachine();
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
