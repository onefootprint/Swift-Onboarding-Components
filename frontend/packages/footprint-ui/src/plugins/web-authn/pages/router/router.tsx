import React, { useEffect } from 'react';

import useWebAuthnMachine from '../../hooks/use-web-authn-machine';
import { States } from '../../utils/machine';
import NewTabProcessing from '../new-tab-processing';
import NewTabRequest from '../new-tab-request';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useWebAuthnMachine();
  const isDone =
    state.matches(States.webAuthnSucceeded) ||
    state.matches(States.webAuthnFailed);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches(States.newTabProcessing)) {
    return <NewTabProcessing />;
  }

  if (state.matches(States.newTabRequest)) {
    return <NewTabRequest />;
  }

  return null;
};

export default Router;
