import React, { useEffect } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';
import { States } from '../../utils/state-machine/types';
import Error from '../error';
import Failure from '../failure';
import IdDocBackPhoto from '../id-doc-back-photo';
import IdDocCountryAndType from '../id-doc-country-and-type';
import IdDocFrontPhoto from '../id-doc-front-photo';
import ProcessingDocuments from '../processing-documents';
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
  if (state.matches(States.idDocFrontImage)) {
    return <IdDocFrontPhoto />;
  }
  if (state.matches(States.idDocBackImage)) {
    return <IdDocBackPhoto />;
  }
  if (state.matches(States.selfiePrompt)) {
    return <SelfiePrompt />;
  }
  if (state.matches(States.selfieImage)) {
    return <SelfiePhoto />;
  }
  if (state.matches(States.processingDocuments)) {
    return <ProcessingDocuments />;
  }
  if (state.matches(States.error)) {
    return <Error />;
  }
  if (state.matches(States.failure)) {
    return <Failure />;
  }

  return null;
};

export default Router;
