import { useObserveCollector } from '@onefootprint/dev-tools';
import {
  InitShimmer,
  useGetOnboardingConfig,
} from '@onefootprint/idv-elements';
import {
  CLIENT_PUBLIC_KEY_HEADER,
  CollectedDataOptionLabels,
  OnboardingConfig,
} from '@onefootprint/types';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import useTenantPublicKey from '../../hooks/use-tenant-public-key';
import useFootprintProviderArgs from './hooks/use-footprint-provider-args/use-footprint-provider-args';

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
      onSuccess: (config: OnboardingConfig) => {
        observeCollector.setAppContext({
          config,
        });
        send({
          type: 'initContextUpdated',
          payload: {
            config: {
              ...config,
              mustCollectData: config.mustCollectData.map(
                (attr: string) => CollectedDataOptionLabels[attr],
              ),
              canAccessData: config.canAccessData.map(
                (attr: string) => CollectedDataOptionLabels[attr],
              ),
            },
          },
        });
      },
      onError: () => {
        send({
          type: 'configRequestFailed',
        });
      },
    },
  );

  useFootprintProviderArgs(args => {
    const {
      bootstrapData,
      options: { showCompletionPage },
    } = args;
    send({
      type: 'initContextUpdated',
      payload: {
        bootstrapData,
        showCompletionPage,
      },
    });
  });

  return <InitShimmer />;
};

export default Init;
