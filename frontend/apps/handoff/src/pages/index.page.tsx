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

  if (state.matches(States.init)) {
    return <Init />;
  }
  if (state.matches(States.complete)) {
    return <Complete />;
  }
  if (state.matches(States.canceled)) {
    return <Canceled />;
  }
  if (state.matches(States.expired)) {
    return <Expired />;
  }
  if (state.matches(States.checkRequirements)) {
    return <CheckRequirements />;
  }
  if (state.matches(States.liveness)) {
    if (!authToken || !device) {
      return null;
    }
    return (
      <Liveness
        context={{
          authToken,
          device,
        }}
        onDone={() => {
          send({ type: Events.livenessCompleted });
        }}
      />
    );
  }
  if (state.matches(States.idDoc)) {
    if (!authToken || !device) {
      return null;
    }
    return (
      <IdDoc
        context={{
          authToken,
          device,
          customData: {
            documentRequestId: requirements?.idDocRequestId ?? '',
          },
        }}
        onDone={() => {
          send({ type: Events.idDocCompleted });
        }}
      />
    );
  }
  return null;
};

export default Root;
