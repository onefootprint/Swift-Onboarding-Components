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
  const isDone = state.done;
  const observeCollector = useObserveCollector();
  useLogStateMachine('idv', state);

  useEffect(() => {
    if (isDone) {
      onComplete();
    }
  }, [isDone, onComplete]);

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
