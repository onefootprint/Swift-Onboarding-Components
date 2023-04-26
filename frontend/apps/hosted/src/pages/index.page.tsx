import Idv from '@onefootprint/idv';
import { AppErrorBoundary } from '@onefootprint/idv-elements';
import { useLayoutOptions } from '@onefootprint/idv-elements/src/components/layout/components/layout-options-provider';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import BoKycIntro from './bo-kyc-intro';
import Init from './init';

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
      {state.matches('boKycIntro') && <BoKycIntro />}
      {state.matches('idv') && (
        <Idv
          data={{
            tenantPk: key,
            userData: invited,
          }}
          layout={layout}
        />
      )}
    </AppErrorBoundary>
  );
};

export default Root;
