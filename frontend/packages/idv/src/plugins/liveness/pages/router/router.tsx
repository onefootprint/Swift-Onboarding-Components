import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import { trackAction } from '../../../../utils/logger';
import useLivenessMachine from '../../hooks/use-liveness-machine';
import Register from '../register';
import Unavailable from '../unavailable';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useLivenessMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('liveness', state);

  useEffect(() => {
    trackAction('passkeys:started');
  }, []);

  useEffect(() => {
    if (isDone) {
      trackAction('passkeys:completed');
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('register')) {
    return <Register />;
  }
  if (state.matches('unavailable')) {
    return <Unavailable />;
  }
  return null;
};

export default Router;
