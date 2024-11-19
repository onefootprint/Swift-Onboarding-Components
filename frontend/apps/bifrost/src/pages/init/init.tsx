import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import {
  InitShimmer,
  Logger,
  checkIsInIframe,
  checkIsSocialMediaBrowser,
  getLogger,
  useGetOnboardingConfig,
} from '@onefootprint/idv';
import type { IdDocOutcome, IdvBootstrapData, OverallOutcome, PublicOnboardingConfig } from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { useFlags } from 'launchdarkly-react-client-sdk';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import { isAlphanumeric } from '@onefootprint/core';
import { useRequestError } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import useProps from './hooks/use-props';

const { logError, logInfo, logTrack } = getLogger({ location: 'bifrost-init' });

const logPopulatedBootstrapKeys = (bootstrapData: IdvBootstrapData): void => {
  const populatedBootstrapKeys = Object.entries(bootstrapData)
    .filter(([_key, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
    .map(([key]) => key)
    .join(',');

  if (populatedBootstrapKeys) {
    logTrack(`Populated bootstrap keys ${populatedBootstrapKeys}`);
  }
};

const isPropsSaved = (context: Record<string, unknown>) => {
  const { bootstrapData, showCompletionPage, showLogo, l10n, authToken } = context;
  return (
    bootstrapData !== undefined &&
    showCompletionPage !== undefined &&
    showLogo !== undefined &&
    l10n !== undefined &&
    authToken !== undefined
  );
};

const setupLogger = ({ orgIds, config }: { orgIds: Set<string>; config: PublicOnboardingConfig }) => {
  const isInIframe = checkIsInIframe();
  const isRecordDisabled = orgIds.has(config.orgId);

  if (config.isLive && isRecordDisabled) {
    logInfo(`Session recording disabled for org ${config.orgId}`);
  }

  if (config.isLive && !isRecordDisabled) {
    Logger.startSessionReplay();
    Logger.setGlobalContext({
      application_id: String(process.env.NEXT_PUBLIC_DDOG_RUM_APPLICATION_BIFROST),
      iframe: !!isInIframe,
      isAppClipEnabled: config.isAppClipEnabled,
      isInstantAppEnabled: config.isInstantAppEnabled,
      isSkipConfirmEnabled: !!config.skipConfirm,
      isStepUpEnabled: !!config.isStepupEnabled,
      kind: String(config.kind),
      orgId: config.orgId,
      orgName: config.orgName,
      publicKey: config.key,
      socialMedia: checkIsSocialMediaBrowser(),
    });
  }
};

const Init = () => {
  const [state, send] = useBifrostMachine();
  const { authToken: authTokenContext, publicKey: publicKeyContext } = state.context;
  const { DoNotRecordTenantOrgIdOnLogRocket } = useFlags();
  const { getErrorCode } = useRequestError();
  const orgIds = new Set<string>(DoNotRecordTenantOrgIdOnLogRocket);
  const obConfigAuth = publicKeyContext ? { [CLIENT_PUBLIC_KEY_HEADER]: publicKeyContext } : undefined;
  const toast = useToast();

  useGetOnboardingConfig(
    { obConfigAuth, authToken: authTokenContext },
    {
      onSuccess: ({ config }) => {
        setupLogger({
          orgIds,
          config,
        });
        send({
          type: 'initContextUpdated',
          payload: { config: { ...config } },
        });
      },
      onError: err => {
        logError('Fetching onboarding config failed', err);
        send({ type: 'configRequestFailed' });
      },
    },
  );

  useProps({
    onSuccess: (props: FootprintVerifyDataProps) => {
      if (isPropsSaved(state.context)) return;

      const {
        authToken = '',
        isComponentsSdk = false,
        l10n = {},
        options = {},
        publicKey = '',
        fixtureResult,
        sandboxId,
        documentFixtureResult,
        shouldRelayToComponents,
      } = props;
      /** userData deprecated after 3.11.0 */
      const bootstrapData = (props?.bootstrapData || props?.userData || {}) as IdvBootstrapData;
      const { showCompletionPage = false, showLogo = false } = options || {};
      const isValidPredefinedSandboxId = sandboxId && isAlphanumeric(sandboxId);
      if (sandboxId && !isValidPredefinedSandboxId) {
        toast.show({
          title: 'Invalid sandbox id provided',
          description: 'The sandbox id can only contain alphanumeric characters. Resetting the sandbox id.',
          variant: 'error',
        });
      }

      send({
        type: 'initContextUpdated',
        payload: {
          authToken,
          bootstrapData,
          isComponentsSdk,
          l10n,
          publicKey,
          showCompletionPage,
          showLogo,
          fixtureResult: fixtureResult as OverallOutcome,
          documentFixtureResult: documentFixtureResult as IdDocOutcome,
          sandboxId: isValidPredefinedSandboxId ? sandboxId : undefined,
          shouldRelayToComponents,
        },
      });

      logPopulatedBootstrapKeys(bootstrapData);
    },
    onError: (error: unknown) => {
      console.error(error);
      const errorCode = getErrorCode(error);
      if (errorCode === 'E118') {
        send({ type: 'sessionExpired' });
        return;
      }
      logError(`Bifrost init failed, couldn't fetch props ${JSON.stringify(error)}`);
      send({ type: 'initError' });
    },
  });

  return <InitShimmer />;
};

export default Init;
