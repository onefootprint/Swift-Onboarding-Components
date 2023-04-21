import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';
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
  const isDone = state.matches('success') || state.matches('failure');
  useLogStateMachine('id-doc', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('idDocCountryAndType')) {
    return <IdDocCountryAndType />;
  }
  if (state.matches('idDocFrontImage')) {
    return <IdDocFrontPhoto />;
  }
  if (state.matches('idDocBackImage')) {
    return <IdDocBackPhoto />;
  }
  if (state.matches('selfiePrompt')) {
    return <SelfiePrompt />;
  }
  if (state.matches('selfieImage')) {
    return <SelfiePhoto />;
  }
  if (state.matches('processingDocuments')) {
    return <ProcessingDocuments />;
  }
  if (state.matches('error')) {
    return <Error />;
  }
  if (state.matches('failure')) {
    return <Failure />;
  }

  return null;
};

export default Router;
