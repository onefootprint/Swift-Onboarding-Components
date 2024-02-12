import React from 'react';

import { IdentifyMachineProvider } from './components/machine-provider';
import Router from './pages/router';
import type { IdentifyProps } from './types';

/**
 * @deprecated
 */
const IdentifyDeprecated = ({ onDone, ...args }: IdentifyProps) => (
  <IdentifyMachineProvider args={args}>
    <Router onDone={onDone} />
  </IdentifyMachineProvider>
);

export default IdentifyDeprecated;
