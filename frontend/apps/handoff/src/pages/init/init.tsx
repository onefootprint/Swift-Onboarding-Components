import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

import useAuthToken from './hooks/use-parse-router-path';

const Init = () => {
  const [, send] = useHandoffMachine();
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
