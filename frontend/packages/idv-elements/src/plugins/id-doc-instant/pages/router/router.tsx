import { useLogStateMachine } from '@onefootprint/dev-tools';
import { useEffect } from 'react';

import useIdDocMachine from '../../hooks/use-id-doc-machine';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state] = useIdDocMachine();
  const isDone = state.matches('success');
  useLogStateMachine('id-doc', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  return null;
};

export default Router;
