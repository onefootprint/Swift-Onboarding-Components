import React, { useEffect } from 'react';

import { useLogStateMachine } from '../../../../../hooks';
import CameraAccessDenied from '../../../components/camera-access-denied';
import CameraAccessRequest from '../../../components/camera-access-request';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import BackPhotoCapture from '../back-photo-capture';
import DesktopBackPhoto from '../desktop-back-photo';
import DesktopBackPhotoRetry from '../desktop-back-photo-retry';
import DesktopConsent from '../desktop-consent';
import DesktopFrontPhoto from '../desktop-front-photo';
import DesktopFrontPhotoRetry from '../desktop-front-photo-retry';
import DesktopProcessing from '../desktop-processing';
import DesktopSelfie from '../desktop-selfie';
import DesktopSelfieFallbackUpload from '../desktop-selfie-fallback-upload';
import DesktopSelfieRetry from '../desktop-selfie-retry';
import FrontPhotoCapture from '../front-photo-capture';
import IdDocBackPhotoRetry from '../id-doc-back-photo-retry';
import IdDocCountryAndType from '../id-doc-country-and-type';
import IdDocFrontPhotoRetry from '../id-doc-front-photo-retry';
import MobileBackPhotoFallbackUpload from '../mobile-back-photo-fallback-upload';
import MobileFrontPhotoFallbackUpload from '../mobile-front-photo-fallback-upload';
import MobileSelfieFallbackUpload from '../mobile-selfie-fallback-upload';
import Processing from '../processing';
import SelfiePhoto from '../selfie-photo';
import SelfieRetryPrompt from '../selfie-retry-prompt';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useIdDocMachine();
  const isDone = state.matches('complete') || state.matches('failure'); // TODO: investigate if we should consider failure as done
  useLogStateMachine('id-doc', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('countryAndType')) {
    return <IdDocCountryAndType />;
  }

  if (state.matches('desktopConsent')) {
    return <DesktopConsent />;
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

  if (state.matches('mobileFrontImageCapture')) {
    return <FrontPhotoCapture />;
  }

  if (state.matches('mobileFrontPhotoFallback')) {
    return <MobileFrontPhotoFallbackUpload />;
  }

  if (state.matches('mobileFrontImageRetry')) {
    return <IdDocFrontPhotoRetry />;
  }

  if (state.matches('desktopFrontImage')) {
    return <DesktopFrontPhoto />;
  }

  if (state.matches('desktopFrontImageRetry')) {
    return <DesktopFrontPhotoRetry />;
  }

  if (state.matches('mobileBackImageCapture')) {
    return <BackPhotoCapture />;
  }

  if (state.matches('mobileBackPhotoFallback')) {
    return <MobileBackPhotoFallbackUpload />;
  }

  if (state.matches('mobileBackImageRetry')) {
    return <IdDocBackPhotoRetry />;
  }

  if (state.matches('desktopBackImage')) {
    return <DesktopBackPhoto />;
  }

  if (state.matches('desktopBackImageRetry')) {
    return <DesktopBackPhotoRetry />;
  }

  if (state.matches('mobileSelfieImage')) {
    return <SelfiePhoto />;
  }

  if (state.matches('mobileSelfieFallback')) {
    return <MobileSelfieFallbackUpload />;
  }

  if (state.matches('mobileSelfieImageRetry')) {
    return <SelfieRetryPrompt />;
  }

  if (state.matches('desktopSelfieImage')) {
    return <DesktopSelfie />;
  }

  if (state.matches('desktopSelfieFallback')) {
    return <DesktopSelfieFallbackUpload />;
  }

  if (state.matches('desktopSelfieImageRetry')) {
    return <DesktopSelfieRetry />;
  }

  if (state.matches('mobileProcessing')) {
    return <Processing />;
  }

  if (state.matches('desktopProcessing')) {
    return <DesktopProcessing />;
  }

  return null;
};

export default Router;
