import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  AppErrorBoundary,
  Identify,
  Onboarding,
} from '@onefootprint/idv-elements';
import React from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';

const Router = () => {
  const [state, send] = useIdvMachine();
  const {
    bootstrapData,
    tenantPk,
    sandboxSuffix,
    authToken,
    email,
    userFound,
  } = state.context;
  useLogStateMachine('idv', state);

  return (
    <AppErrorBoundary
      onReset={() => {
        send({ type: 'reset' });
      }}
    >
      {state.matches('identify') && (
        <Identify
          bootstrapData={bootstrapData}
          tenantPk={tenantPk}
          onDone={payload => {
            send({ type: 'identifyCompleted', payload });
          }}
        />
      )}
      {state.matches('onboarding') && (
        <Onboarding
          userFound={userFound}
          tenantPk={tenantPk}
          authToken={authToken}
          userData={{
            email,
          }}
          sandboxSuffix={sandboxSuffix}
          onDone={payload => {
            send({ type: 'onboardingCompleted', payload });
          }}
        />
      )}
    </AppErrorBoundary>
  );
};

export default Router;
