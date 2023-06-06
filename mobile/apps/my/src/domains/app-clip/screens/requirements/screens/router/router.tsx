import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';

import IdDoc from '@/components/id-doc';
import Liveness from '@/components/liveness';

import CheckRequirements from '../check-requirements';
import createMachine from './utils/state-machine';

type RouterProps = {
  authToken: string;
  onDone: () => void;
};

const Router = ({ authToken, onDone }: RouterProps) => {
  const [state, send] = useMachine(() => createMachine());

  useEffect(() => {
    if (state.done) {
      onDone();
    }
  }, [state.done]);

  return (
    <>
      {state.matches('check') && (
        <CheckRequirements
          authToken={authToken}
          onSuccess={remainingRequirements => {
            send({
              type: 'requirementsReceived',
              payload: {
                remainingRequirements,
              },
            });
          }}
        />
      )}
      {state.matches('liveness') && (
        <Liveness
          authToken={authToken}
          onDone={() => send({ type: 'requirementCompleted' })}
        />
      )}
      {state.matches('idDoc') && (
        <IdDoc
          authToken={authToken}
          onDone={() => send({ type: 'requirementCompleted' })}
        />
      )}
    </>
  );
};

export default Router;
