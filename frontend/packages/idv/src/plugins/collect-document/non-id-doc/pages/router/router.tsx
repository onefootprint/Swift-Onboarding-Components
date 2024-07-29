import React, { useEffect } from 'react';

import { useLogStateMachine } from '../../../../../hooks';
import CameraAccessDenied from '../../../components/camera-access-denied';
import CameraAccessRequest from '../../../components/camera-access-request';
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
  const [state, send] = useNonIdDocMachine();
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

  if (state.matches('mobileRequestCameraAccess')) {
    return (
      <CameraAccessRequest
        onClose={() => send({ type: 'navigatedToPrev' })}
        onError={() => send({ type: 'cameraAccessDenied', payload: { status: 'denied' } })}
        onSuccess={stream => send({ type: 'cameraAccessGranted', payload: { stream, status: 'granted' } })}
      />
    );
  }

  if (state.matches('mobileCameraAccessDenied')) {
    return <CameraAccessDenied device={state.context.device} onClose={() => send({ type: 'navigatedToPrev' })} />;
  }

  if (state.matches('mobileImageCapture')) {
    return <MobileImageCapture />;
  }

  if (state.matches('mobileRetry')) {
    return <MobileRetry />;
  }

  if (state.matches('desktopRetry')) {
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
