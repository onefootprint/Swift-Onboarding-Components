import { useEffect } from 'react';

import { useLogStateMachine } from '@/idv/hooks';
import CameraAccessDenied from '../../../components/camera-access-denied';
import CameraAccessRequest from '../../../components/camera-access-request';
import CaptureRetryPrompt from '../../components/capture-retry-prompt';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import BackPhotoCapture from '../back-photo-capture';
import DesktopCapture from '../desktop-capture';
import DesktopConsent from '../desktop-consent';
import DesktopProcessing from '../desktop-processing';
import DesktopSelfie from '../desktop-selfie';
import DesktopSelfieRetry from '../desktop-selfie-retry';
import FrontPhotoCapture from '../front-photo-capture';
import IdDocCountryAndType from '../id-doc-country-and-type';
import MobileFallbackUpload from '../mobile-fallback-upload';
import Processing from '../processing';
import SelfiePhoto from '../selfie-photo';

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
        onSuccess={() => send({ type: 'cameraAccessGranted', payload: { status: 'granted' } })}
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
    return <MobileFallbackUpload imageType="front" onTakePhotoClick={() => send({ type: 'startImageCapture' })} />;
  }

  if (state.matches('mobileFrontImageRetry')) {
    return <CaptureRetryPrompt imageType="front" onComplete={payload => send({ type: 'receivedImage', payload })} />;
  }

  if (state.matches('desktopFrontImage')) {
    return (
      <DesktopCapture
        imageType="front"
        onBack={() => send({ type: 'navigatedToCountryDoc' })}
        onComplete={payload => send({ type: 'receivedImage', payload })}
      />
    );
  }

  if (state.matches('desktopFrontImageRetry')) {
    return (
      <DesktopCapture
        imageType="front"
        isRetry
        onBack={() => send({ type: 'navigatedToCountryDoc' })}
        onComplete={payload => send({ type: 'receivedImage', payload })}
      />
    );
  }

  if (state.matches('mobileBackImageCapture')) {
    return <BackPhotoCapture />;
  }

  if (state.matches('mobileBackPhotoFallback')) {
    return <MobileFallbackUpload imageType="back" />;
  }

  if (state.matches('mobileBackImageRetry')) {
    return <CaptureRetryPrompt imageType="back" onComplete={payload => send({ type: 'receivedImage', payload })} />;
  }

  if (state.matches('desktopBackImage')) {
    return (
      <DesktopCapture
        imageType="back"
        onBack={() => send({ type: 'navigatedToCountryDoc' })}
        onComplete={payload => send({ type: 'receivedImage', payload })}
      />
    );
  }

  if (state.matches('desktopBackImageRetry')) {
    return (
      <DesktopCapture
        imageType="back"
        isRetry
        onBack={() => send({ type: 'navigatedToCountryDoc' })}
        onComplete={payload => send({ type: 'receivedImage', payload })}
      />
    );
  }

  if (state.matches('mobileSelfieImage')) {
    return <SelfiePhoto />;
  }

  if (state.matches('mobileSelfieFallback')) {
    return <MobileFallbackUpload imageType="selfie" />;
  }

  if (state.matches('mobileSelfieImageRetry')) {
    return <CaptureRetryPrompt imageType="selfie" onComplete={payload => send({ type: 'receivedImage', payload })} />;
  }

  if (state.matches('desktopSelfieImage')) {
    return <DesktopSelfie />;
  }

  if (state.matches('desktopSelfieFallback')) {
    return <DesktopCapture imageType="selfie" onComplete={payload => send({ type: 'receivedImage', payload })} />;
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
