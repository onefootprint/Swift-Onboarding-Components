import { useObserveCollector } from '@onefootprint/dev-tools';
import {
  InitShimmer,
  Logger,
  useGetD2PStatus,
  useGetOnboardingStatus,
  useParseHandoffUrl,
  useUpdateD2PStatus,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import type { GetD2PResponse } from '@onefootprint/types';
import { D2PStatus, D2PStatusUpdate } from '@onefootprint/types';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

const Init = () => {
  const [state, send] = useHandoffMachine();
  const { authToken = '' } = state.context;
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const observeCollector = useObserveCollector();

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
      Logger.error('Parsing handoff URL failed on init page', 'handoff-init');
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
    Logger.identify({ opener, bifrostSessionId });
  };

  const updateD2PStatus = () => {
    if (!authToken) {
      Logger.error('Found empty auth token while updating d2p', 'handoff-init');
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
          Logger.warn(
            `Updating the d2p status to in progress failed: ${getErrorMessage(
              error,
            )}`,
            'handoff-init',
          );
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

          if (status === D2PStatus.waiting || status === D2PStatus.inProgress) {
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
        Logger.warn(
          `Fetching d2p status failed on handoff init page: ${getErrorMessage(
            error,
          )}`,
          'handoff-init',
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
        Logger.identify({
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
        Logger.warn(
          `Fetching onboarding status failed on handoff init page: ${getErrorMessage(
            error,
          )}`,
          'handoff-init',
        );
      },
    },
  });

  return <InitShimmer />;
};

export default Init;
