import { useMachine } from '@xstate/react';
import React from 'react';

import Canceled from '../canceled';
import Completed from '../completed';
import ErrorComponent from '../error';
import Expired from '../expired';
import Init from '../init';
import Requirements from '../requirements';
import useGetD2PStatus from './hooks/use-get-d2p-status';
import createMachine from './utils/state-machine';

type RouterProps = {
  authToken: string;
};

const Router = ({ authToken }: RouterProps) => {
  const [state, send] = useMachine(() => createMachine(authToken));
  useGetD2PStatus({
    enabled: !state.done,
    authToken,
    options: {
      onSuccess: ({ status }) => {
        send({ type: 'statusReceived', payload: { status } });
      },
      onError: () => {
        send({ type: 'statusReceived', payload: { isError: true } });
      },
    },
  });

  return (
    <>
      {state.matches('init') && (
        <Init
          authToken={authToken}
          onSuccess={() => send({ type: 'initCompleted' })}
          onError={() => send({ type: 'initFailed' })}
        />
      )}
      {state.matches('requirements') && (
        <Requirements authToken={authToken} onDone={() => send({ type: 'requirementsCompleted' })} />
      )}
      {state.matches('error') && <ErrorComponent />}
      {state.matches('canceled') && <Canceled />}
      {state.matches('expired') && <Expired />}
      {state.matches('completed') && <Completed authToken={authToken} />}
    </>
  );
};

export default Router;
