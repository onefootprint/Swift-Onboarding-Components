import {
  useLogStateMachine,
  useObserveCollector,
} from '@onefootprint/dev-tools';
import { Identify, Onboarding } from '@onefootprint/idv-elements';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import useIdvMachine from '../../hooks/use-idv-machine';
import Error from '../error';

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
  const observeCollector = useObserveCollector();
  useLogStateMachine('idv', state);

  return (
    <ErrorBoundary
      FallbackComponent={Error}
      onError={(error, stack) => {
        observeCollector.logError('error', error, { stack });
      }}
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
    </ErrorBoundary>
  );
};

export default Router;
