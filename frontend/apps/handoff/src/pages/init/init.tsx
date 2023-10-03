import { getSessionId, useObserveCollector } from '@onefootprint/dev-tools';
import {
  NavigationHeader,
  useGetD2PStatus,
  useGetOnboardingStatus,
  useParseHandoffUrl,
  useUpdateD2PStatus,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import type { GetD2PResponse } from '@onefootprint/types';
import { D2PStatus, D2PStatusUpdate } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import * as LogRocket from 'logrocket';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

const Init = () => {
  const [state, send] = useHandoffMachine();
  const { authToken = '' } = state.context;
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const observeCollector = useObserveCollector();
  const sessionId = getSessionId();

  useParseHandoffUrl({
    onSuccess: (authTokenFromUrl: string) => {
      if (!state.done) {
        send({
          type: 'initContextUpdated',
          payload: {
            authToken: authTokenFromUrl,
          },
        });
      }
    },
    onError: () => {
      console.error('Parsing handoff URL failed on init page');
    },
  });

  const logContext = (data: GetD2PResponse) => {
    const { meta } = data;
    const opener = meta?.opener ?? 'unknown';
    const bifrostSessionId = meta?.sessionId ?? '';
    observeCollector.setAppContext({
      opener,
      bifrostSessionId,
    });
    LogRocket.identify(sessionId, {
      bifrostSessionId,
    });
  };

  const updateD2PStatus = () => {
    if (!authToken) {
      console.error('Found empty auth token while updating d2p');
      return;
    }

    // Tell the api that d2p is in progress now
    updateD2PStatusMutation.mutate(
      {
        authToken,
        status: D2PStatusUpdate.inProgress,
      },
      {
        onSuccess() {
          if (!state.done) {
            send({
              type: 'initContextUpdated',
              payload: {
                updatedStatus: true,
              },
            });
          }
        },
        onError(error: unknown) {
          console.warn(
            'Updating the d2p status to in progress failed: ',
            getErrorMessage(error),
          );
        },
      },
    );
  };

  // Fetch the status only once when the authToken has been parsed from url
  useGetD2PStatus({
    enabled: !state.done,
    refetchInterval: false,
    authToken,
    options: {
      onSuccess: (data: GetD2PResponse) => {
        logContext(data);

        if (!state.done) {
          const { meta, status } = data;
          const opener = meta?.opener ?? 'unknown';
          const { sandboxIdDocOutcome: idDocOutcome } = meta;
          send({
            type: 'initContextUpdated',
            payload: {
              opener,
              idDocOutcome,
            },
          });

          if (status === D2PStatus.waiting) {
            updateD2PStatus();
          } else if (
            status === D2PStatus.completed ||
            status === D2PStatus.failed
          ) {
            send({
              type: 'd2pAlreadyCompleted',
            });
          } else if (status === D2PStatus.canceled) {
            send({
              type: 'd2pCanceled',
            });
          }
        }
      },
      onError: (error: unknown) => {
        console.error(
          'Fetching d2p status failed on handoff init page:',
          getErrorMessage(error),
        );
      },
    },
  });

  useGetOnboardingStatus({
    enabled: !state.done,
    authToken,
    options: {
      onSuccess: ({ obConfiguration }) => {
        observeCollector.setAppContext({
          config: obConfiguration,
        });
        const { orgName, orgId, key } = obConfiguration;
        LogRocket.identify(sessionId, {
          orgName,
          orgId,
          publicKey: key,
        });

        if (!state.done) {
          send({
            type: 'initContextUpdated',
            payload: {
              onboardingConfig: obConfiguration,
            },
          });
        }
      },
      onError: (error: unknown) => {
        console.error(
          'Fetching onboarding status failed on handoff init page:',
          getErrorMessage(error),
        );
      },
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
