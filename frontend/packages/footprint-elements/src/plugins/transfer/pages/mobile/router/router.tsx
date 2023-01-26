import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useMobileMachine, {
  States,
} from '../../../hooks/mobile/use-mobile-machine';
import NewTabProcessing from '../new-tab-processing';
import NewTabRequest from '../new-tab-request';
import SkipLiveness from '../skip-liveness';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useMobileMachine();
  const isDone = state.matches(States.success) || state.matches(States.failure);
  useLogStateMachine('transfer-mobile', state);

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

  if (state.matches(States.skipLiveness)) {
    return <SkipLiveness />;
  }

  return null;
};

export default Router;
