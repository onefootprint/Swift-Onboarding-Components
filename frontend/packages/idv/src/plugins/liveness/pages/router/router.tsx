import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import useLivenessMachine from '../../hooks/use-liveness-machine';
import Register from '../register';
import Retry from '../retry';
import Unavailable from '../unavailable';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useLivenessMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('liveness', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('register')) {
    return <Register />;
  }
  if (state.matches('retry')) {
    return <Retry />;
  }
  // TODO when on a desktop that supports passkey registration in iframe, we need to transfer...
  if (state.matches('unavailable')) {
    return <Unavailable />;
  }
  return null;
};

export default Router;
