import Idv from '@onefootprint/idv';
import { AppErrorBoundary } from '@onefootprint/idv-elements';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import Init from './init';
import Intro from './intro';

const Root = () => {
  const [state, send] = useHostedMachine();
  const { businessBoKycData, onboardingConfig } = state.context;
  const { invited } = businessBoKycData || {};
  const { key } = onboardingConfig || {};

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
          tenantPk={key}
          userData={invited}
          onComplete={() => {
            send({ type: 'idvCompleted' });
          }}
        />
      )}
    </AppErrorBoundary>
  );
};

export default Root;
