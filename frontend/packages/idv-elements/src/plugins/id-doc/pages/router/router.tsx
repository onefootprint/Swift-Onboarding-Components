import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';
import BackPhotoCapture from '../back-photo-capture';
import DesktopBackPhoto from '../desktop-back-photo';
import DesktopBackPhotoRetry from '../desktop-back-photo-retry';
import DesktopConsent from '../desktop-consent';
import DesktopFrontPhoto from '../desktop-front-photo';
import DesktopFrontPhotoRetry from '../desktop-front-photo-retry';
import DesktopProcessing from '../desktop-processing';
import DesktopSelfie from '../desktop-selfie';
import DesktopSelfieRetry from '../desktop-selfie-retry';
import FrontPhotoCapture from '../front-photo-capture';
import IdDocBackPhoto from '../id-doc-back-photo';
import IdDocBackPhotoRetry from '../id-doc-back-photo-retry';
import IdDocCountryAndType from '../id-doc-country-and-type';
import IdDocFrontPhoto from '../id-doc-front-photo';
import IdDocFrontPhotoRetry from '../id-doc-front-photo-retry';
import Processing from '../processing';
import SelfiePhoto from '../selfie-photo';
import SelfiePrompt from '../selfie-prompt';
import SelfieRetryPrompt from '../selfie-retry-prompt';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useIdDocMachine();
  const isDone = state.matches('complete') || state.matches('failure');
  useLogStateMachine('id-doc', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('countryAndType')) {
    return <IdDocCountryAndType />;
  }

  if (state.matches('consentDesktop')) {
    return <DesktopConsent />;
  }

  if (state.matches('frontImageMobile')) {
    return <IdDocFrontPhoto />;
  }

  if (state.matches('frontImageCaptureMobile')) {
    return <FrontPhotoCapture />;
  }

  if (state.matches('frontImageRetryMobile')) {
    return <IdDocFrontPhotoRetry />;
  }

  if (state.matches('frontImageDesktop')) {
    return <DesktopFrontPhoto />;
  }

  if (state.matches('frontImageRetryDesktop')) {
    return <DesktopFrontPhotoRetry />;
  }

  if (state.matches('backImageMobile')) {
    return <IdDocBackPhoto />;
  }

  if (state.matches('backImageCaptureMobile')) {
    return <BackPhotoCapture />;
  }

  if (state.matches('backImageRetryMobile')) {
    return <IdDocBackPhotoRetry />;
  }

  if (state.matches('backImageDesktop')) {
    return <DesktopBackPhoto />;
  }

  if (state.matches('backImageRetryDesktop')) {
    return <DesktopBackPhotoRetry />;
  }

  if (state.matches('selfiePromptMobile')) {
    return <SelfiePrompt />;
  }

  if (state.matches('selfieImageMobile')) {
    return <SelfiePhoto />;
  }

  if (state.matches('selfieImageRetryMobile')) {
    return <SelfieRetryPrompt />;
  }

  if (state.matches('selfieImageDesktop')) {
    return <DesktopSelfie />;
  }

  if (state.matches('selfieImageRetryDesktop')) {
    return <DesktopSelfieRetry />;
  }

  if (state.matches('processingMobile')) {
    return <Processing />;
  }

  if (state.matches('processingDesktop')) {
    return <DesktopProcessing />;
  }

  return null;
};

export default Router;
