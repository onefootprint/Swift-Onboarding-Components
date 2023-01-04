import React, { useEffect } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';
import { States } from '../../utils/state-machine/types';
import Failure from '../failure';
import IdDocBackPhoto from '../id-doc-back-photo';
import IdDocCountryAndType from '../id-doc-country-and-type';
import IdDocFrontPhoto from '../id-doc-front-photo';
import ProcessingDocuments from '../processing-documents';
import RetryIdDocBackPhoto from '../retry-id-doc-back-photo';
import RetryIdDocFrontPhoto from '../retry-id-doc-front-photo';
import SelfiePhoto from '../selfie-photo';
import SelfiePrompt from '../selfie-prompt';

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

  if (state.matches(States.idDocCountryAndType)) {
    return <IdDocCountryAndType />;
  }
  if (state.matches(States.idDocFrontPhoto)) {
    return <IdDocFrontPhoto />;
  }
  if (state.matches(States.idDocBackPhoto)) {
    return <IdDocBackPhoto />;
  }
  if (state.matches(States.selfiePrompt)) {
    return <SelfiePrompt />;
  }
  if (state.matches(States.selfiePhoto)) {
    return <SelfiePhoto />;
  }
  if (state.matches(States.processingDocuments)) {
    return <ProcessingDocuments />;
  }
  if (state.matches(States.retryIdDocFrontPhoto)) {
    return <RetryIdDocFrontPhoto />;
  }
  if (state.matches(States.retryIdDocBackPhoto)) {
    return <RetryIdDocBackPhoto />;
  }
  if (state.matches(States.failure)) {
    return <Failure />;
  }

  return null;
};

export default Router;
