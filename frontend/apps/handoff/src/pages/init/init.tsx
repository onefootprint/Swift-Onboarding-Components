import {
  InitShimmer,
  Logger,
  getLogger,
  useGetD2PStatus,
  useGetOnboardingStatus,
  useParseHandoffUrl,
  useUpdateD2PStatus,
} from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { GetD2PResponse, PublicOnboardingConfig } from '@onefootprint/types';
import { D2PStatus, D2PStatusUpdate } from '@onefootprint/types';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

const logContext = ({ meta }: GetD2PResponse) => {
  Logger.identify({
    fp_session_id: String(meta?.sessionId),
    l10n: JSON.stringify(meta?.l10n),
    opener: String(meta?.opener),
    redirectUrl: String(meta?.redirectUrl),
  });
};

const setupLogger = (config: PublicOnboardingConfig, orgIds: Set<string>) => {
  if (config.isLive && !orgIds.has(config.orgId)) {
    Logger.startSessionReplay();
    Logger.identify({
      appClipExperienceId: config.appClipExperienceId,
      isAppClipEnabled: config.isAppClipEnabled,
      isInstantAppEnabled: config.isInstantAppEnabled,
      isNoPhoneFlow: config.isNoPhoneFlow,
      kind: String(config.kind),
      orgId: config.orgId,
      orgName: config.orgName,
      publicKey: config.key,
      requiresIdDoc: config.requiresIdDoc,
    });
  }
};

const { logError, logWarn } = getLogger({ location: 'handoff-init' });

const Init = () => {
  const [state, send] = useHandoffMachine();
  const { authToken = '' } = state.context;
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const { DoNotRecordTenantOrgIdOnLogRocket } = useFlags();
  const orgIds = new Set<string>(DoNotRecordTenantOrgIdOnLogRocket);

  useParseHandoffUrl({
    onSuccess: (authTokenFromUrl: string) => {
      if (!state.done) {
        send({
          type: 'initContextUpdated',
          payload: { authToken: authTokenFromUrl },
        });
      }
    },
    onError: () => {
      logError('Parsing handoff URL failed on init page');
    },
  });

  const updateD2PStatus = () => {
    if (!authToken) {
      logError('Found empty auth token while updating d2p');
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
              payload: { updatedStatus: true },
            });
          }
        },
        onError(err: unknown) {
          logWarn(`Updating the d2p status to in progress failed: ${getErrorMessage(err)}`, err);
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
          const l10n = meta?.l10n;
          const { sandboxIdDocOutcome: idDocOutcome } = meta;
          send({
            type: 'initContextUpdated',
            payload: { opener, idDocOutcome, l10n },
          });

          if (status === D2PStatus.waiting || status === D2PStatus.inProgress) {
            updateD2PStatus();
          } else if (status === D2PStatus.completed || status === D2PStatus.failed) {
            send({ type: 'd2pAlreadyCompleted' });
          } else if (status === D2PStatus.canceled) {
            send({ type: 'd2pCanceled' });
          }
        }
      },
      onError: (err: unknown) => {
        logWarn(`Fetching d2p status failed on handoff init page: ${getErrorMessage(err)}`, err);
      },
    },
  });

  useGetOnboardingStatus({
    enabled: !state.done,
    authToken,
    options: {
      onSuccess: ({ obConfiguration }) => {
        setupLogger(obConfiguration, orgIds);

        if (!state.done) {
          send({
            type: 'initContextUpdated',
            payload: { onboardingConfig: obConfiguration },
          });
        }
      },
      onError: (err: unknown) => {
        logWarn(`Fetching onboarding status failed on handoff init page: ${getErrorMessage(err)}`, err);
      },
    },
  });

  return <InitShimmer />;
};

export default Init;
