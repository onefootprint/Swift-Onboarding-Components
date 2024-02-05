import { useMachine } from '@xstate/react';
import React from 'react';

import Register from './components/register';
import Retry from './components/retry';
import createMachine from './utils/state-machine';

export type PasskeysProps = {
  authToken: string;
  onDone?: (deviceResponseJson?: string | null) => void;
};

const Passkeys = ({ authToken, onDone }: PasskeysProps) => {
  const [state, send] = useMachine(() => createMachine());

  const handleError = () => {
    send({ type: 'failed' });
  };

  const handleSuccess = (deviceResponseJson: string) => {
    onDone?.(deviceResponseJson);
  };

  const handleSkip = () => {
    onDone?.(null);
  };

  return (
    <>
      {state.matches('register') && (
        <Register
          authToken={authToken}
          onError={handleError}
          onSkip={handleSkip}
          onSuccess={handleSuccess}
        />
      )}
      {state.matches('retry') && (
        <Retry authToken={authToken} onSkip={handleSkip} onSuccess={onDone} />
      )}
    </>
  );
};

export default Passkeys;
