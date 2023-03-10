import {
  useLogStateMachine,
  useObserveCollector,
} from '@onefootprint/dev-tools';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import AuthenticationSuccess from './authentication-success';
import Complete from './complete';
import ConfigInvalid from './config-invalid';
import Error from './error';
import Identify from './identify';
import Init from './init';
import Onboarding from './onboarding';
import SandboxOutcome from './sandbox-outcome';

const Root = () => {
  const [state, send] = useBifrostMachine();
  const {
    device,
    bootstrapData,
    config,
    sandboxSuffix,
    userFound,
    authToken,
    email,
  } = state.context;
  const observeCollector = useObserveCollector();
  useLogStateMachine('bifrost', state);

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
      {state.matches('init') && <Init />}
      {state.matches('configInvalid') && <ConfigInvalid />}
      {state.matches('sandboxOutcome') && <SandboxOutcome />}
      {state.matches('identify') && (
        <Identify
          device={device}
          bootstrapData={bootstrapData}
          config={config}
          identifierSuffix={sandboxSuffix}
          onDone={payload => {
            send({ type: 'identifyCompleted', payload });
          }}
        />
      )}
      {state.matches('onboarding') && (
        <Onboarding
          userFound={userFound}
          device={device}
          config={config}
          authToken={authToken}
          email={email}
          onDone={payload => {
            send({ type: 'onboardingCompleted', payload });
          }}
        />
      )}
      {state.matches('authenticationSuccess') && <AuthenticationSuccess />}
      {state.matches('complete') && <Complete />}
    </ErrorBoundary>
  );
};

export default Root;
