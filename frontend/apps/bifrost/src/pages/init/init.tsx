import { useObserveCollector } from '@onefootprint/dev-tools';
import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import {
  checkIsInIframe,
  checkIsSocialMediaBrowser,
  InitShimmer,
  Logger,
  useGetOnboardingConfig,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import type {
  IdvBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { useTimeout } from 'usehooks-ts';

import useProps from './hooks/use-props';
import { POST_MESSAGE_TIMEOUT } from './hooks/use-props/use-props';

const STUCK_ON_SHIMMER_TIMEOUT = POST_MESSAGE_TIMEOUT * 3;

const Init = () => {
  const [state, send] = useBifrostMachine();
  const {
    authToken: authTokenContext,
    publicKey: publicKeyContext,
    config: configContext,
  } = state.context;
  const observeCollector = useObserveCollector();
  const { DoNotRecordTenantOrgIdOnLogRocket } = useFlags();
  const orgIds = new Set<string>(DoNotRecordTenantOrgIdOnLogRocket);
  const obConfigAuth = publicKeyContext
    ? { [CLIENT_PUBLIC_KEY_HEADER]: publicKeyContext }
    : undefined;

  const setupLogger = (config: PublicOnboardingConfig) => {
    const isInIframe = checkIsInIframe();
    observeCollector.setAppContext({
      config,
    });
    const { orgName, orgId, key, isLive } = config;
    if (isLive && !orgIds.has(orgId)) {
      Logger.setupLogRocket('bifrost');
      Logger.identify({
        orgName,
        orgId,
        publicKey: key,
        iframe: !!isInIframe,
        socialMedia: checkIsSocialMediaBrowser(),
      });
    }
  };

  useTimeout(() => {
    Logger.error(
      `User is stuck on init shimmer screen for 3+ seconds. Known args: ${JSON.stringify(
        {
          publicKey: publicKeyContext,
          config: configContext,
          isPropsSaved: isPropsSaved(),
        },
      )}`,
      'init-shimmer',
    );
  }, STUCK_ON_SHIMMER_TIMEOUT);

  // TODO: delete this when all customers migrate to footprint-js v 3.8+
  // When fetching the sdkArgs from API, we will also get back the onboarding config
  useGetOnboardingConfig(
    { obConfigAuth, authToken: authTokenContext },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
        setupLogger(config);

        send({
          type: 'initContextUpdated',
          payload: {
            config: { ...config },
          },
        });
      },
      onError: error => {
        Logger.error(
          `Fetching onboarding config in bifrost init failed with error: 
        ${getErrorMessage(error)}`,
          'bifrost-init',
        );
        send({
          type: 'configRequestFailed',
        });
      },
    },
  );

  const isPropsSaved = () => {
    const { bootstrapData, showCompletionPage, showLogo, l10n, authToken } =
      state.context;
    return (
      bootstrapData !== undefined &&
      showCompletionPage !== undefined &&
      showLogo !== undefined &&
      l10n !== undefined &&
      authToken !== undefined
    );
  };

  useProps(
    (props: FootprintVerifyDataProps) => {
      if (isPropsSaved()) {
        return;
      }

      const {
        userData = {},
        options = {},
        l10n = {},
        authToken = '',
        publicKey = '',
      } = props;
      const { showCompletionPage = false, showLogo = false } = options || {};
      send({
        type: 'initContextUpdated',
        payload: {
          bootstrapData: userData as IdvBootstrapData,
          showCompletionPage,
          showLogo,
          l10n,
          authToken,
          publicKey,
        },
      });
    },
    (error: unknown) => {
      Logger.error(
        `Message: Failed to fetch initial properties ${getErrorMessage(error)}`,
        'init-props',
      );
      send({ type: 'initError' });
    },
  );

  return <InitShimmer />;
};

export default Init;
