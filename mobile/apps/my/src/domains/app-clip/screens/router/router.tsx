import { useMachine } from '@xstate/react';
import React from 'react';

import Canceled from '../canceled';
import Expired from '../expired';
import Init from '../init';
import Liveness from '../liveness';
import Success from '../success';
import machine from './utils/state-machine';

const Router = () => {
  const [state, send] = useMachine(machine);
  const { authToken = '' } = state.context;
  return (
    <>
      {state.matches('init') && (
        <Init
          onSuccess={authToken => {
            send({ type: 'started', payload: { authToken } });
          }}
          onError={() => {
            alert('error');
          }}
        />
      )}
      {state.matches('canceled') && <Canceled />}
      {state.matches('expired') && <Expired />}
      {state.matches('liveness') && (
        <Liveness
          authToken={authToken}
          onSuccess={() => {
            send({ type: 'requirementCompleted' });
          }}
        />
      )}
      {state.matches('completed') && <Success />}
    </>
  );
};

export default Router;
