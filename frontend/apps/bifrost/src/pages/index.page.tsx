import {
  useLogStateMachine,
  useObserveCollector,
} from '@onefootprint/dev-tools';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { Events, States } from 'src/utils/state-machine/bifrost';

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
  const observeCollector = useObserveCollector();
  useLogStateMachine('bifrost', state);

  return (
    <ErrorBoundary
      FallbackComponent={Error}
      onError={(error, stack) => {
        observeCollector.logError('error', error, { stack });
      }}
      onReset={() => {
        send({ type: Events.reset });
      }}
    >
      {state.matches(States.init) && <Init />}
      {state.matches(States.configInvalid) && <ConfigInvalid />}
      {state.matches(States.sandboxOutcome) && <SandboxOutcome />}
      {state.matches(States.identify) && <Identify />}
      {state.matches(States.onboarding) && <Onboarding />}
      {state.matches(States.authenticationSuccess) && <AuthenticationSuccess />}
      {state.matches(States.complete) && <Complete />}
    </ErrorBoundary>
  );
};

export default Root;
