import { useObserveCollector } from '@onefootprint/dev-tools';
import {
  InitShimmer,
  useGetOnboardingConfig,
} from '@onefootprint/idv-elements';
import {
  CollectedDataOptionLabels,
  OnboardingConfig,
} from '@onefootprint/types';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import useTenantPublicKey from '../../hooks/use-tenant-public-key';
import useBootstrapData from './hooks/use-bootstrap-data';

const Init = () => {
  const tenantPk = useTenantPublicKey();
  const [, send] = useBifrostMachine();
  const observeCollector = useObserveCollector();

  useGetOnboardingConfig(
    { tenantPk },
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

  useBootstrapData(bootstrapData => {
    observeCollector.setAppContext({
      bootstrapData,
    });
    send({
      type: 'initContextUpdated',
      payload: {
        bootstrapData,
      },
    });
  });

  return <InitShimmer />;
};

export default Init;
