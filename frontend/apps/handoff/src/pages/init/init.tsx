import { useObserveCollector } from '@onefootprint/dev-tools';
import {
  NavigationHeader,
  useGetD2PStatus,
  useGetOnboardingStatus,
  useParseHandoffUrl,
  useUpdateD2PStatus,
} from '@onefootprint/footprint-elements';
import { DeviceInfo, useDeviceInfo } from '@onefootprint/hooks';
import { D2PStatusUpdate, GetD2PResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import convertRequirements from 'src/utils/convert-requirements';
import { Events } from 'src/utils/state-machine';
import styled from 'styled-components';

const Init = () => {
  const [state, send] = useHandoffMachine();
  const { authToken } = state.context;
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const observeCollector = useObserveCollector();

  useParseHandoffUrl({
    onSuccess: (authTokenFromUrl: string) => {
      // Tell the api that d2p is in progress now
      updateD2PStatusMutation.mutate(
        {
          authToken: authTokenFromUrl,
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
                authToken: authTokenFromUrl,
              },
            });
          },
        },
      );
    },
  });

  // Fetch the status only once when the authToken has been parsed from url
  useGetD2PStatus({
    refetchInterval: false,
    authToken: authToken ?? '',
    options: {
      onSuccess: (data: GetD2PResponse) => {
        const { meta } = data;
        const opener = meta?.opener ?? 'unknown';
        const bifrostSessionId = meta?.sessionId ?? '';
        observeCollector.setAppContext({
          opener,
          bifrostSessionId,
        });

        send({
          type: Events.initContextUpdated,
          payload: {
            opener,
          },
        });
      },
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

  useGetOnboardingStatus(authToken ?? '', {
    onSuccess: ({ obConfiguration, requirements }) => {
      send({
        type: Events.initContextUpdated,
        payload: {
          onboardingConfig: obConfiguration,
          requirements: convertRequirements(requirements),
        },
      });
    },
  });

  return (
    <LoadingContainer>
      <NavigationHeader />
      <LoadingIndicator />
    </LoadingContainer>
  );
};

const LoadingContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
`;

export default Init;
