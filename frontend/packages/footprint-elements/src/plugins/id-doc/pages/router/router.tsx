import React, { useEffect } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';
import { States } from '../../utils/state-machine/types';
import CountryAndTypeSelection from '../country-and-type-selection';
import Failure from '../failure';
import ProcessingDocuments from '../processing-documents';
import RetryBackPhoto from '../retry-back-photo';
import RetryFrontPhoto from '../retry-front-photo';
import TakeOrUploadBackPhoto from '../take-or-upload-back-photo';
import TakeOrUploadFrontPhoto from '../take-or-upload-front-photo';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useIdDocMachine();
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
    return <ProcessingDocuments />;
  }
  if (state.matches(States.retryFrontPhoto)) {
    return <RetryFrontPhoto />;
  }
  if (state.matches(States.retryBackPhoto)) {
    return <RetryBackPhoto />;
  }
  if (state.matches(States.failure)) {
    return <Failure />;
  }

  return null;
};

export default Router;
