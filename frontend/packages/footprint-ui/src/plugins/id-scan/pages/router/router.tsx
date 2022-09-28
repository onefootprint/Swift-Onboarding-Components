import React, { useEffect } from 'react';

import { useIdScanMachine } from '../../components/machine-provider';
import { States } from '../../utils/state-machine/types';
import CountryAndTypeSelection from '../country-and-type-selection';
import IdScanFailed from '../id-scan-failed';
import ProcessingPhoto from '../processing-photo';
import RetryBackPhoto from '../retry-back-photo';
import RetryFrontPhoto from '../retry-front-photo';
import TakeOrUploadBackPhoto from '../take-or-upload-back-photo';
import TakeOrUploadFrontPhoto from '../take-or-upload-front-photo';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useIdScanMachine();
  const isDone = state.matches(States.success) || state.matches(States.failure);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches(States.idCountryAndTypeSelection)) {
    return <CountryAndTypeSelection />;
  }
  if (state.matches(States.takeOrUploadFrontPhoto)) {
    return <TakeOrUploadFrontPhoto />;
  }
  if (state.matches(States.takeOrUploadBackPhoto)) {
    return <TakeOrUploadBackPhoto />;
  }
  if (state.matches(States.processingPhoto)) {
    return <ProcessingPhoto />;
  }
  if (state.matches(States.retryFrontPhoto)) {
    return <RetryFrontPhoto />;
  }
  if (state.matches(States.retryBackPhoto)) {
    return <RetryBackPhoto />;
  }
  if (state.matches(States.failure)) {
    return <IdScanFailed />;
  }

  return null;
};

export default Router;
