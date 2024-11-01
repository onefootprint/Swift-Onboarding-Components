import {
  InitShimmer,
  Logger,
  getLogger,
  useGetD2PStatus,
  useGetOnboardingConfig,
  useParseHandoffUrl,
  useUpdateD2PStatus,
} from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { GetD2PResponse, PublicOnboardingConfig } from '@onefootprint/types';
import { D2PStatus, D2PStatusUpdate } from '@onefootprint/types';
import { useFlags } from 'launchdarkly-react-client-sdk';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

const getSdkVersionQueryParam = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URL(window.location.href).searchParams.get('sdkv') || '';
};

const appendLogContext = ({ meta }: GetD2PResponse) => {
  Logger.appendGlobalContext({
    fp_session_id: String(meta?.sessionId),
    l10n: JSON.stringify(meta?.l10n),
    opener: String(meta?.opener),
    redirectUrl: String(meta?.redirectUrl),
    sdkVersion: getSdkVersionQueryParam(),
  });
};

const setupLogger = (config: PublicOnboardingConfig, orgIds: Set<string>) => {
  if (config.isLive && !orgIds.has(config.orgId)) {
    Logger.startSessionReplay();
    Logger.setGlobalContext({
      // @ts-expect-error: browser support
      deviceMemory: typeof navigator?.deviceMemory === 'number' ? navigator.deviceMemory : undefined,
      // @ts-expect-error: browser support
      deviceConnection: typeof navigator?.connection !== 'undefined' ? navigator.connection : undefined,
      isAppClipEnabled: config.isAppClipEnabled,
      isInstantAppEnabled: config.isInstantAppEnabled,
      kind: String(config.kind),
      orgId: config.orgId,
      orgName: config.orgName,
      publicKey: config.key,
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
        appendLogContext(data);

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

  useGetOnboardingConfig(
    { authToken },
    {
      onSuccess: obConfiguration => {
        setupLogger(obConfiguration, orgIds);

        if (!state.done) {
          send({
            type: 'initContextUpdated',
            payload: { onboardingConfig: obConfiguration },
          });
        }
      },
      onError: (err: unknown) => {
        logWarn(
          `Fetching onboarding status failed on handoff init page: ${getErrorMessage(err)}
`,
          err,
        );
      },
    },
  );

  return <InitShimmer />;
};

export default Init;
