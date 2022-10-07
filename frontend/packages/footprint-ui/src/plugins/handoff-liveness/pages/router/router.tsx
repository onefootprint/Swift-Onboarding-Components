import React, { useEffect } from 'react';

import { useHandoffLivenessMachine } from '../../components/machine-provider';
import { States } from '../../utils/state-machine/types';
import Register from '../register';
import Retry from '../retry';
import Success from '../success';
import Unavailable from '../unavailable';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useHandoffLivenessMachine();
  const isDone = state.matches(States.completed);

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
  if (state.matches(States.success)) {
    return <Success />;
  }
  return null;
};

export default Router;
