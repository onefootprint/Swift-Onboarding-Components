import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';
import IdDocCountryAndType from '../id-doc-country-and-type';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useIdDocMachine();
  const isDone = state.matches('complete');
  useLogStateMachine('id-doc', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  if (state.matches('countryAndType')) {
    return <IdDocCountryAndType />;
  }

  return null;
};

export default Router;
