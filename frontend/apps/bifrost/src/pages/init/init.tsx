import { useObserveCollector } from '@onefootprint/dev-tools';
import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import {
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
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import useProps from './hooks/use-props';

const Init = () => {
  const [state, send] = useBifrostMachine();
  const { authToken: authTokenContext, publicKey: publicKeyContext } =
    state.context;
  const observeCollector = useObserveCollector();
  const obConfigAuth = publicKeyContext
    ? { [CLIENT_PUBLIC_KEY_HEADER]: publicKeyContext }
    : undefined;

  // TODO: delete this when all customers migrate to footprint-js v 3.8+
  // When fetching the sdkArgs from API, we will also get back the onboarding config
  useGetOnboardingConfig(
    { obConfigAuth, authToken: authTokenContext },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
        const { orgName, orgId, key } = config;
        Logger.identify({
          orgName,
          orgId,
          publicKey: key,
        });
        observeCollector.setAppContext({
          config,
        });

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

  useProps((props: FootprintVerifyDataProps) => {
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
  });

  return <InitShimmer />;
};

export default Init;
