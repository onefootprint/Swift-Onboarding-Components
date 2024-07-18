import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../../hooks/ui/use-log-state-machine';
import { useNonIdDocMachine } from '../../components/machine-provider';
import DesktopProcessing from '../desktop-processing';
import DesktopRetry from '../desktop-retry';
import DocumentPrompt from '../document-prompt';
import Init from '../init';
import MobileImageCapture from '../mobile-image-capture';
import MobileProcessing from '../mobile-processing';
import MobileRetry from '../mobile-retry';

type RouterProps = {
  onDone: () => void;
};
const Router = ({ onDone }: RouterProps) => {
  const [state] = useNonIdDocMachine();
  const isDone = state.matches('complete') || state.matches('failure'); // TODO: investigate if we should consider failure as done
  useLogStateMachine('non-id-doc', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('init')) {
    return <Init />;
  }

  if (state.matches('documentPrompt')) {
    return <DocumentPrompt />;
  }

  if (state.matches('imageCaptureMobile')) {
    return <MobileImageCapture />;
  }

  if (state.matches('retryMobile')) {
    return <MobileRetry />;
  }

  if (state.matches('retryDesktop')) {
    return <DesktopRetry />;
  }

  if (state.matches('mobileProcessing')) {
    return <MobileProcessing />;
  }

  if (state.matches('desktopProcessing')) {
    return <DesktopProcessing />;
  }
  return <div>{`Router Non id doc flow. State name: ${state.value}`}</div>;
};

export default Router;
