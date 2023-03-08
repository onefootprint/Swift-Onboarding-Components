import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import { useCollectKybDataMachine } from '../../components/machine-provider';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useCollectKybDataMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('collect-kyc-data', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  // TODO: implement different pages
  return <div>Router</div>;
};

export default Router;
