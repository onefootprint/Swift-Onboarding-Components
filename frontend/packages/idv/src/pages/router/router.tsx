import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';

type RouterProps = {
  onComplete: () => void;
};

const Router = ({ onComplete }: RouterProps) => {
  const [state] = useIdvMachine();
  const isDone = state.done;
  useLogStateMachine('idv', state);

  useEffect(() => {
    if (isDone) {
      onComplete();
    }
  }, [isDone, onComplete]);

  return <div>TODO</div>;
};

export default Router;
