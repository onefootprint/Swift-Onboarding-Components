import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useMobileMachine from '../../../hooks/mobile/use-mobile-machine';
import NewTabProcessing from '../new-tab-processing';
import NewTabRequest from '../new-tab-request';
import SkipLiveness from '../skip-liveness';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useMobileMachine();
  const isDone = state.matches('success') || state.matches('failure');
  useLogStateMachine('transfer-mobile', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('newTabProcessing')) {
    return <NewTabProcessing />;
  }

  if (state.matches('newTabRequest')) {
    return <NewTabRequest />;
  }

  if (state.matches('skipLiveness')) {
    return <SkipLiveness />;
  }

  return null;
};

export default Router;
