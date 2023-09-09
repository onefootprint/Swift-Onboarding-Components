import { useObserveCollector } from '@onefootprint/dev-tools';
import {
  NavigationHeader,
  useGetD2PStatus,
  useGetOnboardingStatus,
  useParseHandoffUrl,
  useUpdateD2PStatus,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import { D2PStatusUpdate, GetD2PResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import * as LogRocket from 'logrocket';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

const Init = () => {
  const [state, send] = useHandoffMachine();
  const { authToken = '' } = state.context;
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
            console.warn('Updating the d2p status to in progress failed');
            send({
              type: 'd2pAlreadyCompleted',
            });
          },
          onSettled() {
            send({
              type: 'initContextUpdated',
              payload: {
                authToken: authTokenFromUrl,
              },
            });
          },
        },
      );
    },
    onError: () => {
      console.error('Parsing handoff URL failed on init page');
    },
  });

  // Fetch the status only once when the authToken has been parsed from url
  useGetD2PStatus({
    refetchInterval: false,
    authToken,
    options: {
      onSuccess: (data: GetD2PResponse) => {
        const { meta } = data;
        const opener = meta?.opener ?? 'unknown';
        const bifrostSessionId = meta?.sessionId ?? '';
        const { sandboxIdDocOutcome: idDocOutcome } = meta;
        observeCollector.setAppContext({
          opener,
          bifrostSessionId,
        });
        LogRocket.identify(bifrostSessionId);

        send({
          type: 'initContextUpdated',
          payload: {
            opener,
            idDocOutcome,
          },
        });
      },
      onError: (error: unknown) => {
        console.error(
          'Fetching d2p status failed on handoff init page:',
          getErrorMessage(error),
        );
      },
    },
  });

  useGetOnboardingStatus(authToken, {
    onSuccess: ({ obConfiguration }) => {
      send({
        type: 'initContextUpdated',
        payload: {
          onboardingConfig: obConfiguration,
        },
      });
    },
    onError: (error: unknown) => {
      console.error(
        'Fetching onboarding status failed on handoff init page:',
        getErrorMessage(error),
      );
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
