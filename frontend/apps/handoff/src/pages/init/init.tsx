import { useObserveCollector } from '@onefootprint/dev-tools';
import {
  useParseHandoffUrl,
  useUpdateD2PStatus,
} from '@onefootprint/footprint-elements';
import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import { D2PStatusUpdate } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events } from 'src/utils/state-machine';

const Init = () => {
  const [, send] = useHandoffMachine();
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const observeCollector = useObserveCollector();

  useParseHandoffUrl({
    onSuccess: (authToken: string) => {
      // Tell the api that d2p is in progress now
      updateD2PStatusMutation.mutate(
        {
          authToken,
          status: D2PStatusUpdate.inProgress,
        },
        {
          onError() {
            // If the handoff was already completed, we will get an error about
            // trying to transition the status backwards
            send({
              type: Events.d2pAlreadyCompleted,
            });
          },
          onSettled() {
            send({
              type: Events.initContextUpdated,
              payload: {
                authToken,
              },
            });
          },
        },
      );
    },
  });

  useDeviceInfo((device: DeviceInfo) => {
    observeCollector.setAppContext({
      device,
    });
    send({
      type: Events.initContextUpdated,
      payload: {
        device,
      },
    });
  });

  return <LoadingIndicator />;
};

export default Init;
