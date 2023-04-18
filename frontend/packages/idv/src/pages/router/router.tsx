import {
  useLogStateMachine,
  useObserveCollector,
} from '@onefootprint/dev-tools';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import useIdvMachine from '../../hooks/use-idv-machine';
import Complete from '../complete';
import ConfigInvalid from '../config-invalid';
import Error from '../error';
import Identify from '../identify';
import Init from '../init';
import SandboxOutcome from '../sandbox-outcome';

const Router = () => {
  const [state, send] = useIdvMachine();
  const { device, bootstrapData, config, sandboxSuffix } = state.context;
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
      {state.matches('complete') && <Complete />}
    </ErrorBoundary>
  );
};

export default Router;
