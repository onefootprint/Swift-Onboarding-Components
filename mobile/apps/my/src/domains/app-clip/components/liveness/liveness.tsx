import { useMachine } from '@xstate/react';
import React from 'react';

import Register from './components/register';
import Retry from './components/retry';
import machine from './utils/state-machine';

export type LivenessProps = {
  context: {
    authToken: string;
  };
  onDone?: () => void;
};

const Liveness = ({ context: { authToken }, onDone }: LivenessProps) => {
  const [state, send] = useMachine(machine);

  return (
    <>
      {state.matches('register') && (
        <Register
          authToken={authToken}
          onError={() => send({ type: 'failed' })}
          onSuccess={onDone}
        />
      )}
      {state.matches('retry') && (
        <Retry authToken={authToken} onSkip={onDone} onSuccess={onDone} />
      )}
    </>
  );
};

export default Liveness;
