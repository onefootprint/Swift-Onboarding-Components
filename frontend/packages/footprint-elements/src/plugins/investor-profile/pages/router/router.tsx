import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useInvestorProfileMachine();
  const isDone = state.matches('completed');
  useLogStateMachine('investor-profile', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  // TODO:
  return <div>Router</div>;
};

export default Router;
