import { getSessionId, useObserveCollector } from '@onefootprint/dev-tools';
import {
  InitShimmer,
  useGetOnboardingConfig,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import type {
  IdvBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import * as LogRocket from 'logrocket';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import useTenantPublicKey from '../../hooks/use-tenant-public-key';
import useProps from './hooks/use-props';
import type { BifrostProps } from './hooks/use-props/types';

const Init = () => {
  const tenantPk = useTenantPublicKey();
  const [, send] = useBifrostMachine();
  const observeCollector = useObserveCollector();
  const sessionId = getSessionId();
  const obConfigAuth = tenantPk
    ? { [CLIENT_PUBLIC_KEY_HEADER]: tenantPk }
    : undefined;

  useGetOnboardingConfig(
    { obConfigAuth },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
        const { orgName, orgId, key } = config;
        LogRocket.identify(sessionId, {
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
        console.error(
          'Fetching onboarding config in bifrost init failed with error:',
          getErrorMessage(error),
        );
        send({
          type: 'configRequestFailed',
        });
      },
    },
  );

  useProps((props: BifrostProps) => {
    const { userData, options, l10n } = props;
    const { showCompletionPage, showLogo } = options || {};
    send({
      type: 'initContextUpdated',
      payload: {
        bootstrapData: userData as IdvBootstrapData,
        showCompletionPage,
        showLogo,
        l10n,
      },
    });
  });

  return <InitShimmer />;
};

export default Init;
