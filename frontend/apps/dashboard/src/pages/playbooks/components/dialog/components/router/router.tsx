import React from 'react';

import { usePlaybookMachine } from '../../machine-provider';
import Type from './components/type';

type RouterProps = {
  onClose: () => void;
};

const Router = ({ onClose }: RouterProps) => {
  const [state, send] = usePlaybookMachine();

  if (state.matches('name')) {
    send('etc');
    onClose();
  }
  return <div>{state.matches('type') && <Type />}</div>;
};

export default Router;
