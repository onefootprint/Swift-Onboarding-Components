import { useMachine } from '@xstate/react';
import React from 'react';

import Register from './components/register';
import Retry from './components/retry';
import createMachine from './utils/state-machine';

export type PasskeysProps = {
  authToken: string;
  onDone?: () => void;
};

const Passkeys = ({ authToken, onDone }: PasskeysProps) => {
  const [state, send] = useMachine(() => createMachine());

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

export default Passkeys;
