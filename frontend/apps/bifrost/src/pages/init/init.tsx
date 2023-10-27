import { useObserveCollector } from '@onefootprint/dev-tools';
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

import useTenantPublicKey from '../../hooks/use-tenant-public-key';
import useProps from './hooks/use-props';
import type { BifrostProps } from './hooks/use-props/types';

const Init = () => {
  const tenantPk = useTenantPublicKey();
  const [state, send] = useBifrostMachine();
  const { authToken: authTokenContext } = state.context;
  const observeCollector = useObserveCollector();
  const obConfigAuth = tenantPk
    ? { [CLIENT_PUBLIC_KEY_HEADER]: tenantPk }
    : undefined;

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

  useProps((props: BifrostProps) => {
    if (isPropsSaved()) {
      return;
    }

    const { userData = {}, options = {}, l10n = {}, authToken = '' } = props;
    const { showCompletionPage = false, showLogo = false } = options || {};
    send({
      type: 'initContextUpdated',
      payload: {
        bootstrapData: userData as IdvBootstrapData,
        showCompletionPage,
        showLogo,
        l10n,
        authToken,
      },
    });
  });

  return <InitShimmer />;
};

export default Init;
