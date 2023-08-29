import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';

import IdDoc from '@/components/id-doc';
import Passkeys from '@/components/passkeys';

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
  }, [state.done, onDone]);

  return (
    <>
      {state.matches('check') && (
        <CheckRequirements
          authToken={authToken}
          onSuccess={remainingRequirements => {
            send({
              type: 'remainingRequirementsReceived',
              payload: {
                remainingRequirements,
              },
            });
          }}
        />
      )}
      {state.matches('passkeys') && (
        <Passkeys
          authToken={authToken}
          onDone={() => send({ type: 'requirementCompleted' })}
        />
      )}
      {state.matches('idDoc') && (
        <IdDoc
          requirement={state.context.remainingRequirements.idDoc}
          authToken={authToken}
          onDone={() => send({ type: 'requirementCompleted' })}
        />
      )}
    </>
  );
};

export default Router;
