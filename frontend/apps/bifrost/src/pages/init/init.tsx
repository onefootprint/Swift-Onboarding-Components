import { useObserveCollector } from '@onefootprint/dev-tools';
import {
  InitShimmer,
  useGetOnboardingConfig,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import {
  CLIENT_PUBLIC_KEY_HEADER,
  IdvBootstrapData,
  PublicOnboardingConfig,
} from '@onefootprint/types';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import useTenantPublicKey from '../../hooks/use-tenant-public-key';
import useProps from './hooks/use-props';
import { BifrostProps } from './hooks/use-props/types';

const Init = () => {
  const tenantPk = useTenantPublicKey();
  const [, send] = useBifrostMachine();
  const observeCollector = useObserveCollector();
  const obConfigAuth = tenantPk
    ? { [CLIENT_PUBLIC_KEY_HEADER]: tenantPk }
    : undefined;

  useGetOnboardingConfig(
    { obConfigAuth },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
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
    const { userData, options } = props;
    const { showCompletionPage, showLogo } = options || {};
    send({
      type: 'initContextUpdated',
      payload: {
        bootstrapData: userData as IdvBootstrapData,
        showCompletionPage,
        showLogo,
      },
    });
  });

  return <InitShimmer />;
};

export default Init;
