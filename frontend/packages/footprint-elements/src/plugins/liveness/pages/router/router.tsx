import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useLivenessMachine from '../../hooks/use-liveness-machine';
import { States } from '../../utils/state-machine/types';
import Register from '../register';
import Retry from '../retry';
import Unavailable from '../unavailable';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useLivenessMachine();
  const isDone = state.matches(States.completed);
  useLogStateMachine('liveness', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches(States.register)) {
    return <Register />;
  }
  if (state.matches(States.retry)) {
    return <Retry />;
  }
  if (state.matches(States.unavailable)) {
    return <Unavailable />;
  }
  return null;
};

export default Router;
