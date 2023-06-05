import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';
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

  if (state.matches('frontImage')) {
    return <IdDocFrontPhoto />;
  }

  if (state.matches('frontImageRetry')) {
    return <IdDocFrontPhotoRetry />;
  }

  if (state.matches('backImage')) {
    return <IdDocBackPhoto />;
  }

  if (state.matches('backImageRetry')) {
    return <IdDocBackPhotoRetry />;
  }

  if (state.matches('selfiePrompt')) {
    return <SelfiePrompt />;
  }

  if (state.matches('selfieImage')) {
    return <SelfiePhoto />;
  }

  if (state.matches('selfieImageRetry')) {
    return <SelfieRetryPrompt />;
  }

  if (state.matches('processing')) {
    return <Processing />;
  }

  return null;
};

export default Router;
