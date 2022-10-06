import React, { useEffect } from 'react';

import { useHandoffLivenessMachine } from '../../components/machine-provider';
import { States } from '../../utils/state-machine/types';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useHandoffLivenessMachine();
  const isDone =
    state.matches(States.success) ||
    state.matches(States.canceled) ||
    state.matches(States.unavailable);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  // TODO: implement each page
  // if (state.matches(States.register)) {
  //   return <Register />;
  // }
  // if (state.matches(States.registerRetry)) {
  //   return <RegisterRetry />;
  // }
  // if (state.matches(States.unavailable)) {
  //   return <Unavailable />;
  // }
  // if (state.matches(States.success)) {
  //   return <Success />;
  // }
  // if (state.matches(States.canceled)) {
  //   return <Canceled />;
  // }
  // if (state.matches(States.expired)) {
  //   return <Expired />;
  // }
  return <div />;
};

export default Router;
