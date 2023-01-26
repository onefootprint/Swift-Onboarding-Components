import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  IdDoc,
  Liveness,
  useGetD2PStatus,
} from '@onefootprint/footprint-elements';
import { GetD2PResponse } from '@onefootprint/types';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events, States } from 'src/utils/state-machine';

import Canceled from './canceled';
import CheckRequirements from './check-requirements';
import Complete from './complete';
import Expired from './expired';
import Init from './init';

const Root = () => {
  const [state, send] = useHandoffMachine();
  const { authToken, device, requirements } = state.context;
  useLogStateMachine('handoff', state);

  const handleSuccess = (data: GetD2PResponse) => {
    send({
      type: Events.statusReceived,
      payload: {
        status: data.status,
      },
    });
  };

  const handleError = () => {
    send({
      type: Events.statusReceived,
      payload: {
        isError: true,
      },
    });
  };

  const pollingEnabled = !state.done;
  useGetD2PStatus(pollingEnabled, authToken ?? '', {
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return (
    <>
      {state.matches(States.init) && <Init />}
      {state.matches(States.complete) && <Complete />}
      {state.matches(States.canceled) && <Canceled />}
      {state.matches(States.expired) && <Expired />}
      {state.matches(States.checkRequirements) && <CheckRequirements />}
      {state.matches(States.liveness) && !!authToken && !!device && (
        <Liveness
          context={{
            authToken,
            device,
          }}
          onDone={() => {
            send({ type: Events.livenessCompleted });
          }}
        />
      )}
      {state.matches(States.init) && !!authToken && !!device && (
        <IdDoc
          context={{
            authToken,
            device,
            customData: {
              shouldCollectIdDoc: requirements?.missingIdDoc,
              shouldCollectSelfie: requirements?.missingSelfie,
              shouldCollectConsent: requirements?.missingConsent,
            },
          }}
          onDone={() => {
            send({ type: Events.idDocCompleted });
          }}
        />
      )}
    </>
  );

  return null;
};

export default Root;
