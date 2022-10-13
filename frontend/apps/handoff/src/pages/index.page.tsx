import { IdScan, Liveness } from 'footprint-elements';
import React from 'react';
import useGetD2pStatus from 'src/hooks/use-get-d2p-status';
import useHandoffMachine from 'src/hooks/use-handoff-machine';
import { Events, States } from 'src/utils/state-machine';

import Canceled from './canceled';
import CheckRequirements from './check-requirements';
import Complete from './complete';
import Expired from './expired';
import Init from './init';

const Root = () => {
  const [state, send] = useHandoffMachine();
  const { authToken, device, tenant } = state.context;
  useGetD2pStatus();

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
    if (!authToken || !device || !tenant) {
      return null;
    }
    return (
      <Liveness
        context={{
          authToken,
          device,
          tenant,
        }}
        metadata={{}}
        onDone={() => {
          send({ type: Events.livenessCompleted });
        }}
      />
    );
  }
  if (state.matches(States.idScan)) {
    if (!authToken || !device || !tenant) {
      return null;
    }
    return (
      <IdScan
        context={{
          authToken,
          device,
          tenant,
        }}
        metadata={{}}
        onDone={() => {
          send({ type: Events.idScanCompleted });
        }}
      />
    );
  }
  return null;
};

export default Root;
