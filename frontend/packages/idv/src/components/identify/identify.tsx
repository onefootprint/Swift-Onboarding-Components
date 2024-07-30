'use client';

import React from 'react';

import Router from './components/router';
import SandboxFooter from './components/sandbox-footer';
import { IdentifyMachineProvider } from './state';
import type { IdentifyMachineArgs } from './state/types';
import type { DoneArgs } from './types';

type IdentifyProps = IdentifyMachineArgs & {
  onDone: (args: DoneArgs) => void;
};

// TODO move this to its own package
const Identify = ({ onDone, ...args }: IdentifyProps): JSX.Element | null => (
  <IdentifyMachineProvider args={args}>
    <Router onDone={onDone} />
    <SandboxFooter />
  </IdentifyMachineProvider>
);

export default Identify;
