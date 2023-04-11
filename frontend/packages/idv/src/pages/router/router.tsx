import {
  useLogStateMachine,
  useObserveCollector,
} from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import useIdvMachine from '../../hooks/use-idv-machine';
import Error from '../error';

type RouterProps = {
  onComplete: () => void;
};

const Router = ({ onComplete }: RouterProps) => {
  const [state, send] = useIdvMachine();
  const isComplete = state.matches('complete');
  const observeCollector = useObserveCollector();
  useLogStateMachine('idv', state);

  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

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
      <div>TODO</div>
    </ErrorBoundary>
  );
};

export default Router;
