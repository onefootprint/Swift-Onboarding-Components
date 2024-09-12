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
import { useTimeout } from 'usehooks-ts';

import { isAlphanumeric } from '@onefootprint/core';
import { useRequestError } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import useProps from './hooks/use-props';

const STUCK_ON_SHIMMER_TIMEOUT = 5000;

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
    Logger.identify({
      application_id: String(process.env.NEXT_PUBLIC_DDOG_RUM_APPLICATION_BIFROST),
      iframe: !!isInIframe,
      isAppClipEnabled: config.isAppClipEnabled,
      isInstantAppEnabled: config.isInstantAppEnabled,
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
  const { authToken: authTokenContext, publicKey: publicKeyContext, config: configContext } = state.context;
  const { DoNotRecordTenantOrgIdOnLogRocket } = useFlags();
  const { getErrorCode } = useRequestError();
  const orgIds = new Set<string>(DoNotRecordTenantOrgIdOnLogRocket);
  const startMs = Date.now();
  const obConfigAuth = publicKeyContext ? { [CLIENT_PUBLIC_KEY_HEADER]: publicKeyContext } : undefined;
  const toast = useToast();

  useTimeout(() => {
    logError(`User is stuck on init shimmer screen for ${(Date.now() - startMs) / 1000} seconds`, undefined, {
      config: JSON.stringify(configContext),
      isPropsSaved: isPropsSaved(state.context),
      publicKey: String(publicKeyContext),
    });
  }, STUCK_ON_SHIMMER_TIMEOUT);

  // TODO: delete this when all customers migrate to footprint-js v 3.8+
  // When fetching the sdkArgs from API, we will also get back the onboarding config
  useGetOnboardingConfig(
    { obConfigAuth, authToken: authTokenContext },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
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

      send({ type: 'initError' });
    },
  });

  return <InitShimmer />;
};

export default Init;
