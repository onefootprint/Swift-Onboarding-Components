import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import { LoadingIndicator } from '@onefootprint/ui';
import { HandoffUrlQuery, useParseHandoffUrl } from 'footprint-elements';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

const Init = () => {
  const [, send] = useHandoffMachine();

  useParseHandoffUrl({
    onSuccess: (query: HandoffUrlQuery) => {
      const { authToken, tenantPk } = query;
      send({
        type: Events.paramsReceived,
        payload: {
          authToken,
          tenantPk,
        },
      });
    },
  });

  useDeviceInfo((info: DeviceInfo) => {
    send({
      type: Events.deviceInfoIdentified,
      payload: info,
    });
  });
  return <LoadingIndicator />;
};

export default Init;
