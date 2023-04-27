import Idv from '@onefootprint/idv';
import { AppErrorBoundary } from '@onefootprint/idv-elements';
import { useLayoutOptions } from '@onefootprint/idv-elements/src/components/layout/components/layout-options-provider';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import Complete from './complete';
import Init from './init';
import Intro from './intro';

const Root = () => {
  const [state, send] = useHostedMachine();
  const { businessBoKycData, onboardingConfig } = state.context;
  const { invited } = businessBoKycData || {};
  const { key } = onboardingConfig || {};
  const { layout } = useLayoutOptions();

  return (
    <AppErrorBoundary
      onReset={() => {
        send({ type: 'reset' });
      }}
    >
      {state.matches('init') && <Init />}
      {state.matches('intro') && <Intro />}
      {state.matches('idv') && (
        <Idv
          data={{
            tenantPk: key,
            userData: invited,
          }}
          layout={layout}
          callbacks={{
            onComplete: () => {
              send({ type: 'idvCompleted' });
            },
          }}
        />
      )}
      {state.matches('complete') && <Complete />}
    </AppErrorBoundary>
  );
};

export default Root;
